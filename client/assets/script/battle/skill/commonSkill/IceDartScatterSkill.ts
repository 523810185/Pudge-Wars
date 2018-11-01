import {BaseNormalSkill} from "../../common/BaseNormalSkill";
import {BallisticSkill} from "../tickSkill/BallisticSkill";
import Core from "../../../core/Core";
import {Unit} from "../../common/Unit";
import {MoveToSkill} from "../tickSkill/MoveToSkill";

export class IceDartScatterSkill implements BaseNormalSkill 
{
    /**施法单位 */
    private m_stUnit: Unit;
    /**释放的方向 */
    private m_stRotVec: cc.Vec2;

    constructor(unit: Unit, rotVec: cc.Vec2) 
    {
        this.m_stUnit = unit;
        this.m_stRotVec = rotVec.normalize();
        this.Init();
    }

    Init(): void 
    {
        // 冰飞镖部分
        let deltaRad = 30 / 180 * Math.PI;
        for(let i = 0; i < 3; i++) 
        {
            let nowRot = this.m_stRotVec;
            if(i == 1) 
            {
                nowRot = this.VecRotate(nowRot, deltaRad);
            }
            else if(i == 2)
            {
                nowRot = this.VecRotate(nowRot, -deltaRad);
            }
            let iceDart = new BallisticSkill("prefabs/ice_dart", this.m_stUnit, this.m_stUnit.GetNode().position,
                nowRot.mul(300), 500, 30, 40, true);
            Core.TickMgr.AddTicker(iceDart);
        }
        // 自身击退部分
        let move = new MoveToSkill(this.m_stUnit, this.m_stUnit.GetNode().position.sub(this.m_stRotVec.mul(150)),
            400);
        Core.TickMgr.AddTicker(move);
    }

    /**
     * 返回向量顺时针旋转rad弧度后的向量
     * @param vec 向量
     * @param rad 弧度值
     */
    private VecRotate(vec: cc.Vec2, rad: number): cc.Vec2 
    {
        return new cc.Vec2(vec.x * Math.cos(rad) - vec.y * Math.sin(rad),
            vec.x * Math.sin(rad) + vec.y * Math.cos(rad));
    }
}