import {BaseTickSkill} from "../BaseTickSkill";
import Core from "../../../core/Core";
import {NodePool} from "../../../common/NodePool";

export class HookSkill implements BaseTickSkill
{
    /**释放点 */
    private m_stStartPos: cc.Vec2;
    /**释放技能的英雄 */
    private m_stHero: cc.Node;
    /**方向向量的模 */
    private m_stRotPos: cc.Vec2;
    /**hookChain的集合 */
    private m_stHookArray: Array<cc.Node>;
    /**钩头 */
    private m_stHookHead: cc.Node;
    /**是否处于返回期 */
    private m_bIsReturn: boolean = false;
    /**被钩到的单位 */
    private m_stHookedNode: cc.Node = null;
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


    /**舞台 */
    private m_stCanvas: cc.Node;

    constructor(hero: cc.Node, startPos: cc.Vec2, rotPos: cc.Vec2) 
    {
        this.m_stHero = hero;
        this.m_stStartPos = startPos;
        this.m_stRotPos = rotPos.normalize();
        this.Init();
    }

    private Init(): void 
    {
        /**获得单位池 */
        this.m_stHookChainPool = Core.GameLogic.PoolMgr.GetHookChainPool();
        this.m_stHookHeadPool = Core.GameLogic.PoolMgr.GetHookHeadPool();

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
                this.m_stHookHeadPool.CheckIn(this.m_stHookHead);
            }
            else 
            {
                let lastHookChain = this.m_stHookArray.pop();
                this.m_stHookHead.position = lastHookChain.position;

                // 钩单位逻辑处理
                if(!this.m_stHookedNode) 
                {
                    this.m_stHookedNode = this.GetHookedHero(this.m_stHero, this.m_stHookHead);
                }
                else 
                {
                    this.m_stHookedNode.position = this.m_stHookHead.position;
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
                if(this.m_stHookedNode != null) 
                {
                    this.m_stHookedNode.position = lastHookChain.position;
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
            if(this.m_stHookedNode == null) 
            {
                this.m_stHookedNode = this.GetHookedHero(this.m_stHero, this.m_stHookHead);
                if(this.m_stHookedNode != null) 
                {
                    this.m_bIsReturn = true;
                }
            }
            else 
            {
                cc.warn("钩子技能逻辑出错啦！");
                this.m_stHookedNode.position = this.m_stHookHead.position;
            }
        }
    }

    /**
     * 得到被钩的节点
     * @param hero 释放技能的单位
     * @param hookHead 钩头
     */
    private GetHookedHero(hero: cc.Node, hookHead: cc.Node): cc.Node
    {
        let hookedNode: cc.Node = null;
        let hookDis: number = 40;
        let unitArray = Core.GameLogic.UnitMgr.UnitArray;
        let minDis: number = -1;
        for(let item of unitArray) 
        {
            if(hero == item.GetNode())
            {
                continue;
            }

            let dis: number = item.GetNode().position.sub(hookHead.position).mag();
            if(dis > hookDis) 
            {
                continue;
            }

            if(minDis < 0) 
            {
                minDis = dis;
                hookedNode = item.GetNode();
            }
            else if(minDis > dis) 
            {
                minDis = dis;
                hookedNode = item.GetNode();
            }
        }
        return hookedNode;
    }

    public IsFinished(): boolean 
    {
        return this.m_bIsReturn == true && this.m_stHookArray.length == 0;
    }

    public Clear(): void 
    {
        this.m_stHookHeadPool.CheckIn(this.m_stHookHead);
    }
}