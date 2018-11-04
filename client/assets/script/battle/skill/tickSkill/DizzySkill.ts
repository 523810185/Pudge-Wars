import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import Core from "../../../core/Core";
import {CoreConfig} from "../../../core/CoreConfig";

export class DizzySkill implements BaseTicker 
{
    /**作用单位  */
    private m_stUnit: Unit;
    /**作用的帧数 */
    private m_iDurationTickNum: number;
    /**计时器 */
    private m_iTickCnt: number;

    /**
     * 
     * @param unit 作用单位
     * @param durationTime 持续时间（单位：秒）
     */
    constructor(unit: Unit, durationTime: number) 
    {
        this.m_stUnit = unit;
        this.m_iDurationTickNum = durationTime * 60;
        this.Init();
    }

    private Init(): void 
    {
        if(this.m_stUnit == Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID)) 
        {
            Core.GameLogic.OperationMgr.UnBindEvent();
        }
        this.m_iTickCnt = 0;
    }

    Update(): void 
    {
        this.m_iTickCnt++;
    }

    IsFinished(): boolean 
    {
        return this.m_iTickCnt >= this.m_iDurationTickNum;
    }

    Clear(): void 
    {
        if(this.m_stUnit == Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID)) 
        {
            Core.GameLogic.OperationMgr.BindEvent();
        }
    }
}