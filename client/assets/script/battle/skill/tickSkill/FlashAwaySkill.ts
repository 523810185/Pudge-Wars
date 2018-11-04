import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import {BallisticSkill} from "./BallisticSkill";
import Core from "../../../core/Core";

export class FlashAwaySkill implements BaseTicker
{
    /**幻影开始的时间（单位：帧） */
    private readonly START_TIME: number = 60 * 0.5;
    /**幻影结束的时间（单位：帧） */
    private readonly DELAY_TIME: number = 60 * 1.0;
    /**两个幻影之间的帧数间隔 */
    private readonly DELTA_TICK_CNT: number = 2;
    /**最远移动的距离 */
    private readonly MAX_DISTANCE: number = 350;
    /**幻影飞行速度 */
    private readonly FLY_SPEED: number = 800;
    /**造成伤害 */
    private readonly DAMAGE: number = 20;
    /**减速百分比 */
    private readonly SLOW_DOWN_PERCENT: number = 80;
    /**减速时间（单位：秒） */
    private readonly SLOW_DOWN_SECOND: number = 2;

    /**施法单位 */
    private m_stUnit: Unit;
    /**初始位置 */
    private m_stStartPos: cc.Vec2;
    /**传送位置 */
    private m_stPos: cc.Vec2;
    /**计时器 */
    private m_iTickCnt: number;
    /**幻影产生计时器 */
    private m_iGhostTickCnt: number;
    /**伤害管理map */
    private m_mapDmgMgr: Map<Unit, boolean>;

    constructor(unit: Unit, pos: cc.Vec2)
    {
        this.m_stUnit = unit;
        this.m_stPos = pos;
        this.m_stStartPos = this.m_stUnit.GetNode().position;
        let dis = this.m_stPos.sub(unit.GetNode().position).mag();
        if(dis > this.MAX_DISTANCE) 
        {
            let vec = pos.sub(this.m_stUnit.GetNode().position).normalize();
            this.m_stPos = unit.GetNode().position.add(vec.mul(this.MAX_DISTANCE));
        }
        this.Init();
    }

    private Init(): void 
    {
        this.m_iTickCnt = 0;
        this.m_iGhostTickCnt = 0;
        this.m_mapDmgMgr = new Map<Unit, boolean>();
        this.m_stUnit.GetNode().position = this.m_stPos;
    }

    Update(): void 
    {
        this.m_iTickCnt++;
        if(this.m_iTickCnt >= this.START_TIME) 
        {
            this.m_iGhostTickCnt++;
            if(this.m_iGhostTickCnt == this.DELTA_TICK_CNT) 
            {
                this.m_iGhostTickCnt = 0;
                let delaySkill = new BallisticSkill("prefabs/pudge", this.m_stUnit, this.m_stStartPos,
                    this.m_stUnit.GetNode().position.sub(this.m_stStartPos), this.FLY_SPEED, this.m_stUnit.CollisionSize,
                    this.DAMAGE, true, this.m_mapDmgMgr);
                Core.TickMgr.AddTicker(delaySkill);
            }
        }
    }

    IsFinished(): boolean 
    {
        return this.m_iTickCnt >= this.DELAY_TIME;
    }

    Clear(): void 
    {

    }
}