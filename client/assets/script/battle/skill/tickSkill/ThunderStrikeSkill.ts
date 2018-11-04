import {BaseTicker} from "../../../common/BaseTicker";
import {Unit, eUnitType} from "../../common/Unit";
import Core from "../../../core/Core";

export class ThunderStrikeSkill implements BaseTicker 
{
    /**伤害延迟帧数 */
    private readonly DAMAGE_DELAY: number = 60 * 0.5;
    /**结束时间 */
    private readonly END_DELAY: number = 60 * 2;
    /**伤害 */
    private readonly DAMAGE: number = 40;
    /**伤害半径 */
    private readonly DAMAGE_RADIUS: number = 80;

    /**计时器 */
    private m_iTickCnt: number;
    /**施法单位 */
    private m_stUnit: Unit;
    /**施法位置 */
    private m_stPos: cc.Vec2;
    /**特效节点 */
    private m_stAnimationNode: cc.Node;

    constructor(unit: Unit, pos: cc.Vec2) 
    {
        this.m_stUnit = unit;
        this.m_stPos = pos;
        this.Init();
    }

    private Init(): void 
    {
        this.m_iTickCnt = 0;
        Core.ResourceMgr.LoadRes("prefabs/thunderStrike", this.OnLoad.bind(this));
    }

    private OnLoad(res): void 
    {
        this.m_stAnimationNode = cc.instantiate(res);
        cc.find("Canvas").addChild(this.m_stAnimationNode);
        this.m_stAnimationNode.position = this.m_stPos;
    }

    Update(): void 
    {
        this.m_iTickCnt++;
        if(this.m_iTickCnt == this.DAMAGE_DELAY) 
        {
            Core.GameLogic.UnitMgr.VisitUnit((unit: Unit, unitID: number) =>
            {
                if(unit.Team != this.m_stUnit.Team && unit.Type != eUnitType.Building
                    && unit.GetNode().position.sub(this.m_stPos).mag() <= unit.CollisionSize + this.DAMAGE_RADIUS) 
                {
                    unit.NowHP -= this.DAMAGE;
                }
            });
        }
    }

    IsFinished(): boolean 
    {
        return this.m_iTickCnt >= this.END_DELAY;
    }

    Clear(): void 
    {
        if(this.m_stAnimationNode != null) 
        {
            this.m_stAnimationNode.destroy();
        }
    }
}