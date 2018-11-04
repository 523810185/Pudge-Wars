import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";

export class DamageReduceSkill implements BaseTicker
{
    /**作用单位 */
    private m_stUnit: Unit;
    /**伤害减少百分比 */
    private m_iDmgReducePercent: number;
    /**持续的帧数 */
    private m_iUsefulTickNum: number;
    /**计时器 */
    private m_iTickCnt: number;

    /**
     * 
     * @param unit 作用单位
     * @param dmgReducePercent 伤害减少百分比（0~100的整数）
     * @param timeSecond 持续的秒数
     */
    constructor(unit: Unit, dmgReducePercent: number, timeSecond: number) 
    {
        this.m_stUnit = unit;
        this.m_iDmgReducePercent = dmgReducePercent;
        this.m_iUsefulTickNum = timeSecond * 60;
        this.Init();
    }

    private Init(): void 
    {
        this.m_iTickCnt = 0;
        this.m_stUnit.AddHPChangeListener(this.OnHPChangeHandler, this);
    }

    /**处理生命值变化 */
    private OnHPChangeHandler(hpChange: number): void 
    {
        if(hpChange < 0) 
        {
            this.m_stUnit.NowHP += Math.abs(hpChange) * this.m_iDmgReducePercent / 100;
        }
    }

    Update(): void 
    {
        this.m_iTickCnt++;
    }

    IsFinished(): boolean 
    {
        return this.m_iTickCnt >= this.m_iUsefulTickNum;
    }

    Clear(): void 
    {
        this.m_stUnit.RemoveHPChangeListener(this);
    }
}