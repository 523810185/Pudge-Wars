import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import {DizzySkill} from "./DizzySkill";
import Core from "../../../core/Core";
import {FloatNumHandler} from "../../../common/FloatNumHandler";
import {LifeChangeSkill} from "./LifeChangeSkill";

export class GalaxyVortexSkill implements BaseTicker 
{
    /**持续时间（以秒为单位） */
    private readonly DURATION_TIME_SECOND: number = 2.5;
    /**造成的伤害 */
    private readonly DAMAGE: number = 35;
    /**被移动的速度（每帧） */
    private readonly MOVE_SPEED: number = 1;
    /**旋转的角度（每帧） */
    private readonly ROTATE_SPEED: number = 4;

    /**施法单位 */
    private m_stSkillUnit: Unit;
    /**命中的单位 */
    private m_stClickUnit: Unit;
    /**帧计时器 */
    private m_iTickCnt: number;
    /**移动的方向 */
    private m_stMoveRot: cc.Vec2;

    constructor(skillUnit: Unit, clickUnit: Unit)
    {
        this.m_stSkillUnit = skillUnit;
        this.m_stClickUnit = clickUnit;
        this.Init();
    }

    private Init(): void 
    {
        // 让双方都无法进行操作
        // TODO ... 改动成持续的施法技能
        let skillTicker = new DizzySkill(this.m_stSkillUnit, this.DURATION_TIME_SECOND);
        let clickTicker = new DizzySkill(this.m_stClickUnit, this.DURATION_TIME_SECOND);
        let dmgTicker = new LifeChangeSkill(this.m_stClickUnit, -this.DAMAGE, this.DURATION_TIME_SECOND);
        Core.TickMgr.AddTicker(skillTicker);
        Core.TickMgr.AddTicker(clickTicker);
        Core.TickMgr.AddTicker(dmgTicker);

        this.m_stMoveRot = this.m_stSkillUnit.GetNode().position.sub(this.m_stClickUnit.GetNode().position).normalize();
        this.m_stMoveRot = new cc.Vec2(FloatNumHandler.PreservedTo(this.m_stMoveRot.x), FloatNumHandler.PreservedTo(this.m_stMoveRot.y));

        this.m_iTickCnt = 0;
    }

    Update(): void 
    {
        this.m_iTickCnt++;
        if(!this.IsFinished())
        {
            let dis = this.m_stSkillUnit.GetNode().position.sub(this.m_stClickUnit.GetNode().position).mag();
            if(dis >= this.MOVE_SPEED) 
            {
                this.m_stClickUnit.GetNode().position = this.m_stClickUnit.GetNode().position.add(this.m_stMoveRot.mul(this.MOVE_SPEED));
            }
            else 
            {
                this.m_stClickUnit.GetNode().position = this.m_stSkillUnit.GetNode().position;
            }

            this.m_stSkillUnit.GetNode().rotation = (this.m_stSkillUnit.GetNode().rotation + this.ROTATE_SPEED) % 360;
            this.m_stClickUnit.GetNode().rotation = (this.m_stClickUnit.GetNode().rotation + this.ROTATE_SPEED) % 360;
        }
    }

    IsFinished(): boolean 
    {
        return this.m_iTickCnt >= this.DURATION_TIME_SECOND * 60;
    }

    Clear(): void 
    {

    }
}