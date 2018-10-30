import {BaseTicker} from "../../../common/BaseTicker";
import Core from "../../../core/Core";
import {NodePool} from "../../../common/NodePool";
import {eTickMessageType} from "../../../core/NetMgr";
import {CoreConfig} from "../../../core/CoreConfig";
import {Unit, eUnitType} from "../../common/Unit";

export class HookSkill implements BaseTicker
{
    /**释放点 */
    private m_stStartPos: cc.Vec2;
    /**释放技能的单位 */
    private m_stHero: Unit;
    /**方向向量的模 */
    private m_stRotPos: cc.Vec2;
    /**hookChain的集合 */
    private m_stHookArray: Array<cc.Node>;
    /**钩头 */
    private m_stHookHead: cc.Node;
    /**是否处于返回期 */
    private m_bIsReturn: boolean = false;
    /**被钩到的单位 */
    private m_stHookedUnit: Unit = null;
    /**被钩到的单位的id */
    private m_stHookedUnitID: number = -1;
    /**钩子的单位池 */
    private m_stHookChainPool: NodePool;
    /**钩头的单位池 */
    private m_stHookHeadPool: NodePool;

    /**一个钩子的长度 */
    private readonly HOOK_ITEM_LENGTH: number = 15;
    /**钩子延伸的最长长度 */
    private readonly HOOK_MAX_LENGTH: number = 450;
    /**钩子的个数 */
    private readonly HOOK_CNT: number = (this.HOOK_MAX_LENGTH / this.HOOK_ITEM_LENGTH) >> 0;

    /**钩子的伤害，以后可能会有动态变化伤害的需求的可能性 */
    private m_iHookDamage: number = 30;
    /**钩子的判定范围 */
    private m_iHookJudgeDis: number = 15;

    /**舞台 */
    private m_stCanvas: cc.Node;

    constructor(hero: Unit, startPos: cc.Vec2, rotPos: cc.Vec2) 
    {
        this.m_stHero = hero;
        this.m_stStartPos = startPos;
        this.m_stRotPos = rotPos.normalize();
        this.Init();
    }

    private Init(): void 
    {
        /**获得单位池 */
        this.m_stHookChainPool = Core.PoolMgr.GetPoolByName("hookChain");
        this.m_stHookHeadPool = Core.PoolMgr.GetPoolByName("hookHead");

        this.m_stHookArray = [];
        this.m_stCanvas = cc.find('Canvas');
        this.m_stHookHead = this.m_stHookHeadPool.CheckOut();
        this.m_stCanvas.addChild(this.m_stHookHead);

        let angle: number = this.CalcAngle(this.m_stRotPos);
        // 钩头朝向设置
        this.m_stHookHead.rotation = angle;
        // 初始化钩头位置
        this.m_stHookHead.position = this.m_stStartPos;
    }

    /**
     * 计算从vec(0,1.0)顺时针旋转到vec之间的角度
     * @param vec 向量vec2
     */
    private CalcAngle(vec: cc.Vec2): number
    {
        let angle: number;
        let temp = new cc.Vec2(0, 1.0);
        angle = vec.dot(temp) / (vec.mag() * temp.mag());

        angle = Math.acos(angle) * 180 / Math.PI;
        if(vec.x < 0) 
        {
            angle = 360 - angle;
        }
        return angle;
    }

    public Update(): void 
    {
        if(this.m_bIsReturn) 
        {
            if(this.m_stHookArray.length == 0) 
            {
                // 其实这里不会到达，如果需要补充结算逻辑，请写到Clear方法中
                this.m_stHookHeadPool.CheckIn(this.m_stHookHead);
            }
            else 
            {
                let lastHookChain = this.m_stHookArray.pop();
                this.m_stHookHead.position = lastHookChain.position;

                // 钩单位逻辑处理
                if(!this.m_stHookedUnit) 
                {
                    this.m_stHookedUnit = this.GetHookedHero(this.m_stHero.GetNode(), this.m_stHookHead);
                }
                else 
                {
                    this.m_stHookedUnit.GetNode().position = this.m_stHookHead.position;
                }

                // 归还最后一节hookChain
                this.m_stHookChainPool.CheckIn(lastHookChain);
            }
        }
        else 
        {
            if(this.m_stHookArray.length == this.HOOK_CNT) 
            {
                this.m_bIsReturn = true;

                // 归还最后一节hookChain
                let lastHookChain = this.m_stHookArray.pop();
                this.m_stHookHead.position = lastHookChain.position;
                if(this.m_stHookedUnit != null) 
                {
                    this.m_stHookedUnit.GetNode().position = lastHookChain.position;
                }
                this.m_stHookChainPool.CheckIn(lastHookChain);
            }
            else 
            {
                let newHookChain = this.m_stHookChainPool.CheckOut();
                this.m_stCanvas.addChild(newHookChain);
                this.m_stHookArray.push(newHookChain);
                newHookChain.position = this.m_stStartPos.add(this.m_stRotPos.mul(this.HOOK_ITEM_LENGTH * this.m_stHookArray.length));
                this.m_stHookHead.position = this.m_stStartPos.add(this.m_stRotPos.mul(this.HOOK_ITEM_LENGTH * (this.m_stHookArray.length + 1)));
            }

            // 钩单位逻辑处理
            if(this.m_stHookedUnit == null) 
            {
                this.m_stHookedUnit = this.GetHookedHero(this.m_stHero.GetNode(), this.m_stHookHead);
                if(this.m_stHookedUnit != null) 
                {
                    this.m_bIsReturn = true;
                }
            }
            else 
            {
                cc.warn("钩子技能逻辑出错啦！");
                this.m_stHookedUnit.GetNode().position = this.m_stHookHead.position;
            }
        }
    }

    /**
     * 得到被钩的单位
     * @param hero 释放技能的单位
     * @param hookHead 钩头
     */
    private GetHookedHero(hero: cc.Node, hookHead: cc.Node): Unit
    {
        let hookedUnit: Unit = null;
        let minDis: number = -1;
        Core.GameLogic.UnitMgr.VisitUnit((item: Unit, unitID: number) =>
        {
            // 钩的条件：不是自己，并且单位的类型是英雄
            if(hero == item.GetNode() || item.Type != eUnitType.Hero)
            {
                return;
            }

            let dis: number = item.GetNode().position.sub(hookHead.position).mag();
            // 钩的条件：范围满足
            if(dis > this.m_iHookJudgeDis + item.CollisionSize) 
            {
                return;
            }

            if(minDis < 0) 
            {
                minDis = dis;
                hookedUnit = item;
                this.m_stHookedUnitID = unitID;
            }
            else if(minDis > dis) 
            {
                minDis = dis;
                hookedUnit = item;
            }
        });

        // 如果被钩到的是自己，那么将被屏蔽一切操作
        if(hookedUnit != null && hookedUnit == Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID)) 
        {
            Core.GameLogic.OperationMgr.UnBindEvent();
        }
        return hookedUnit;
    }

    public IsFinished(): boolean 
    {
        return this.m_bIsReturn == true && this.m_stHookArray.length == 0;
    }

    public Clear(): void 
    {
        this.m_stHookHeadPool.CheckIn(this.m_stHookHead);
        // TODO: 造成伤害应当不用跑帧消息
        // 暂时只由技能释放者发送造成伤害的帧消息
        if(this.m_stHero == Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID) &&
            // 造成伤害的条件，不是同一个阵营的
            this.m_stHookedUnit != null && this.m_stHookedUnit.Team != this.m_stHero.Team) 
        {
            // 造成伤害
            if(this.m_stHookedUnit) 
            {
                let content = {
                    unitID: this.m_stHookedUnitID,
                    hpChange: -this.m_iHookDamage
                };
                Core.NetMgr.SendTickMessage(eTickMessageType.HP_CHANGE, content);
            }
        }

        // 如果被钩到的是自己，那么将恢复操作
        if(this.m_stHookedUnit != null && this.m_stHookedUnit == Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID)) 
        {
            Core.GameLogic.OperationMgr.BindEvent();
        }
    }
}