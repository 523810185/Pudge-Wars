import {BaseTicker} from "../../../common/BaseTicker";
import Core from "../../../core/Core";
import {FloatNumHandler} from "../../../common/FloatNumHandler";
import {Unit, eUnitTeam} from "../../common/Unit";
import {eTickMessageType} from "../../../core/NetMgr";
import {SlowDownSkill} from "./SlowDownSkill";
import {CoreConfig} from "../../../core/CoreConfig";

/**发射一个弹道类技能并且使得碰到的敌方单位减速 */
export class BallisticSkill implements BaseTicker
{
    /**弹道的节点 */
    private m_stBallisticNode: cc.Node;
    /**是否已经加载完弹道的资源 */
    private m_bIsLoaded: boolean;
    /**逻辑的位置 */
    private m_stLogicPos: cc.Vec2;
    /**方向的单位向量 */
    private m_stRotNormalVec: cc.Vec2;
    /**移动的距离 */
    private m_iMoveDis: number;
    /**每帧移动的距离 */
    private m_iTickSpeed: number;
    /**记录单位是否已经受到影响的表 */
    private m_mapIsGoDmg: Map<Unit, boolean>;
    /**影响半径 */
    private m_iRidius: number;
    /**伤害 */
    private m_iDmg: number;
    /**是否减速 */
    private m_bIsGoSlow: boolean;
    /**施法单位 */
    private m_stUnit: Unit;

    /**
     * 
     * @param prefabUrl 预置体的url
     * @param unit 施法单位
     * @param initPos 初始位置
     * @param flyVec 飞行的向量（包含了方向和距离）
     * @param flySpeed 飞行的速度（每秒移动的距离）
     * @param ballisticRidius 弹道的影响半径
     * @param ballisticDmg 造成的伤害
     * @param isSlowDown 是否减速碰到的单位，默认否，默认的减速减少50%移速4s
     * @param dmgMap 如果传参，意味着可能多个弹道类技能共用着一个记录的map
     */
    constructor(prefabUrl: string, unit: Unit, initPos: cc.Vec2, flyVec: cc.Vec2, flySpeed: number,
        ballisticRidius: number, ballisticDmg: number, isSlowDown: boolean = false,
        dmgMap: Map<Unit, boolean> = new Map<Unit, boolean>()) 
    {
        // 先把参数保留一下三位小数
        initPos.x = FloatNumHandler.PreservedTo(initPos.x);
        initPos.y = FloatNumHandler.PreservedTo(initPos.y);
        flyVec.x = FloatNumHandler.PreservedTo(flyVec.x);
        flyVec.y = FloatNumHandler.PreservedTo(flyVec.y);

        this.m_stUnit = unit;
        this.m_iRidius = ballisticRidius;
        this.m_iDmg = ballisticDmg;
        this.m_bIsGoSlow = isSlowDown;
        this.m_stLogicPos = initPos;
        this.m_iMoveDis = FloatNumHandler.PreservedTo(flyVec.mag());
        this.m_stRotNormalVec = flyVec.normalize();
        this.m_stRotNormalVec.x = FloatNumHandler.PreservedTo(this.m_stRotNormalVec.x);
        this.m_stRotNormalVec.y = FloatNumHandler.PreservedTo(this.m_stRotNormalVec.y);
        this.m_iTickSpeed = FloatNumHandler.PreservedTo(flySpeed / 60);
        this.m_mapIsGoDmg = dmgMap;
        this.Init();
        Core.ResourceMgr.LoadRes(prefabUrl, this.OnLoad.bind(this));
    }

    private OnLoad(res): void 
    {
        this.m_stBallisticNode = cc.instantiate(res);
        cc.find("Canvas").addChild(this.m_stBallisticNode);
        this.m_stBallisticNode.position = this.m_stLogicPos; // initPos
        this.m_bIsLoaded = true;
    }

    private Init(): void 
    {
        this.m_bIsLoaded = false;
    }

    Update(): void
    {
        // Logic
        if(this.m_iMoveDis >= this.m_iTickSpeed) 
        {
            this.m_stLogicPos = this.m_stLogicPos.add(this.m_stRotNormalVec.mul(this.m_iTickSpeed));
            this.m_iMoveDis -= this.m_iTickSpeed;
        }
        else 
        {
            this.m_stLogicPos = this.m_stLogicPos.add(this.m_stRotNormalVec.mul(this.m_iMoveDis));
            this.m_iMoveDis = 0;
        }
        Core.GameLogic.UnitMgr.VisitUnit((unit: Unit, unitID: number) =>
        {
            if(unit.Team == this.m_stUnit.Team || this.m_mapIsGoDmg.has(unit))
            {
                return;
            }

            // TODO ... 修正可能的浮点数误差
            let dis = unit.GetNode().position.sub(this.m_stLogicPos).mag();
            if(dis <= this.m_iRidius + unit.CollisionSize) 
            {
                this.m_mapIsGoDmg.set(unit, true);
                // 造成伤害
                if(this.m_stUnit == Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID))
                {
                    let content = {
                        unitID: unitID,
                        hpChange: -this.m_iDmg
                    };
                    Core.NetMgr.SendTickMessage(eTickMessageType.HP_CHANGE, content);
                }
                // 减速
                if(this.m_bIsGoSlow) 
                {
                    let slowDown = new SlowDownSkill(unit, true, 50, 4);
                    Core.TickMgr.AddTicker(slowDown);
                }
            }
        });

        // view 
        if(this.m_bIsLoaded) 
        {
            this.m_stBallisticNode.position = this.m_stLogicPos;
        }
    }

    IsFinished(): boolean
    {
        return this.m_iMoveDis < 1e-3;
    }

    Clear(): void
    {
        this.m_stBallisticNode.destroy();
    }
}