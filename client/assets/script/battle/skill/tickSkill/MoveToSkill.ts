import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";

export class MoveToSkill implements BaseTicker
{
    /**移动的单位 */
    private m_stUnit: Unit;
    /**移动的方向向量 */
    private m_stRotVec: cc.Vec2;
    /**移动到的位置 */
    private m_stEndPos: cc.Vec2;
    /**每帧移动的距离，如果为-1则表示每帧移动的距离由移动单位的speed属性来决定 */
    private m_iMoveSpeed: number;

    constructor(unit: Unit, endPos: cc.Vec2, moveSpeed: number = -1) 
    {
        this.m_stUnit = unit;
        this.m_stEndPos = endPos;
        this.m_iMoveSpeed = moveSpeed;

        this.m_stRotVec = endPos.sub(unit.GetNode().position).normalize();
    }

    public Update(): void 
    {
        if(this.IsFinished()) 
        {
            this.m_stUnit.GetNode().position = this.m_stEndPos;
        }
        else 
        {
            let moveLen = this.m_iMoveSpeed == -1 ? this.m_stUnit.Speed : this.m_iMoveSpeed;
            this.m_stUnit.GetNode().position = this.m_stUnit.GetNode().position.add(this.m_stRotVec.mul(moveLen));
        }
    }

    public IsFinished(): boolean 
    {
        let moveLen = this.m_iMoveSpeed == -1 ? this.m_stUnit.Speed : this.m_iMoveSpeed;
        return this.m_stUnit.GetNode().position.sub(this.m_stEndPos).mag() <= moveLen;
    }

    public Clear(): void 
    {

    }
}