import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import {FloatNumHandler} from "../../../common/FloatNumHandler";

export class SlowDownSkill implements BaseTicker 
{
    /**减速单位 */
    private m_stUnit: Unit;
    /**是否按照百分比减速 */
    private m_bSlowDownByPercent: boolean;
    /**减少的速度 */
    private m_iSlowDownSpeed: number;
    /**减少时间的帧数（1秒60帧） */
    private m_iSlowDownTickCnt: number;

    /**帧计时器 */
    private m_iTickCnt: number;

    /**
     * 
     * @param slowDownUnit 被减速的单位
     * @param slowDownByPercent 减速的类型，false表示减少速度的值，true表示减速百分比
     * @param slowDownSpeed 如果slowDownByPercent为false，减速slowDownSpeed，否则减少slowDownSpeed%的移速
     * @param slowDownTime 减速时间，单位为秒
     */
    constructor(slowDownUnit: Unit, slowDownByPercent: boolean, slowDownSpeed: number, slowDownTime: number) 
    {
        this.m_stUnit = slowDownUnit;
        this.m_bSlowDownByPercent = slowDownByPercent;
        if(this.m_bSlowDownByPercent) 
        {
            // 减少值为整数
            this.m_iSlowDownSpeed = FloatNumHandler.PreservedTo(this.m_stUnit.Speed * slowDownSpeed / 100, 0);
        }
        else 
        {
            // 防止减少到0以下
            this.m_iSlowDownSpeed = Math.min(this.m_iSlowDownSpeed, this.m_stUnit.Speed);
        }
        this.m_iSlowDownTickCnt = slowDownTime * 60;

        this.Init();
    }

    private Init(): void 
    {
        this.m_iTickCnt = 0;
        this.m_stUnit.Speed -= this.m_iSlowDownSpeed;
    }

    Update(): void 
    {
        this.m_iTickCnt++;
    }

    IsFinished(): boolean 
    {
        return this.m_iTickCnt >= this.m_iSlowDownTickCnt;
    }

    Clear(): void 
    {
        this.m_stUnit.Speed += this.m_iSlowDownSpeed;
    }
}