import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import {FloatNumHandler} from "../../../common/FloatNumHandler";
import Core from "../../../core/Core";
import {CoreConfig} from "../../../core/CoreConfig";

export class MoveToSkill implements BaseTicker
{
    /**移动的单位 */
    private m_stUnit: Unit;
    /**移动的方向向量 */
    private m_stRotVec: cc.Vec2;
    /**移动到的位置 */
    private m_stEndPos: cc.Vec2;
    /**每秒移动的距离，如果为-1则表示每帧移动的距离由移动单位的speed属性来决定 */
    private m_iMoveSpeed: number;

    constructor(unit: Unit, endPos: cc.Vec2, moveSpeed: number = -1) 
    {
        this.m_stUnit = unit;
        this.m_stEndPos = endPos;
        if(moveSpeed != -1) 
        {
            this.m_iMoveSpeed = FloatNumHandler.PreservedTo(moveSpeed / 60);
        }

        this.m_stRotVec = endPos.sub(unit.GetNode().position).normalize();

        this.Init();
    }

    private Init(): void 
    {
        if(this.m_stUnit == Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID)) 
        {
            Core.GameLogic.OperationMgr.UnBindEvent();
        }
    }

    public Update(): void 
    {
        let moveLen = this.m_iMoveSpeed == -1 ? this.m_stUnit.Speed : this.m_iMoveSpeed;
        if(this.m_stUnit.GetNode().position.sub(this.m_stEndPos).mag() <= moveLen) 
        {
            this.m_stUnit.GetNode().position = this.m_stEndPos;
        }
        else 
        {
            this.m_stUnit.GetNode().position = this.m_stUnit.GetNode().position.add(this.m_stRotVec.mul(moveLen));
        }
    }

    public IsFinished(): boolean 
    {
        return this.m_stUnit.GetNode().position.sub(this.m_stEndPos).mag() <= 1e-3;
    }

    public Clear(): void 
    {
        if(this.m_stUnit == Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID)) 
        {
            Core.GameLogic.OperationMgr.BindEvent();
        }
    }
}