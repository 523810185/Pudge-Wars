import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import {FloatNumHandler} from "../../../common/FloatNumHandler";

export class LifeChangeSkill implements BaseTicker 
{
    /**作用单位 */
    private m_stUnit: Unit;
    /**还剩下多少生命值没变化 */
    private m_iHPChangeRest: number;
    /**每帧变化的生命值 */
    private m_iHPChangeInOneTick: number;

    /**
     * 
     * @param unit 作用单位
     * @param hpChange 生命值改变
     * @param timeSecond 生命值变化所发生的时间（单位：秒），若设置为0则为立刻改变
     */
    constructor(unit: Unit, hpChange: number, timeSecond: number) 
    {
        this.m_stUnit = unit;
        if(timeSecond > 0) 
        {
            this.m_iHPChangeInOneTick = FloatNumHandler.PreservedTo(hpChange / (timeSecond * 60));
            this.m_iHPChangeRest = hpChange;
        }
        else 
        {
            this.m_iHPChangeInOneTick = -1; // useless
            this.m_iHPChangeRest = 0;
        }
        this.Init();
    }

    private Init(): void 
    {

    }

    Update(): void 
    {
        if(Math.abs(this.m_iHPChangeRest) < Math.abs(this.m_iHPChangeInOneTick)) 
        {
            if(this.m_stUnit.IsAlive)
            {
                this.m_stUnit.NowHP += this.m_iHPChangeRest;
            }
            this.m_iHPChangeRest = 0;
        }
        else 
        {
            if(this.m_stUnit.IsAlive) 
            {
                this.m_stUnit.NowHP += this.m_iHPChangeInOneTick;
            }
            this.m_iHPChangeRest -= this.m_iHPChangeInOneTick;
        }
    }

    IsFinished(): boolean 
    {
        return Math.abs(this.m_iHPChangeRest) < 1e-3;
    }

    Clear(): void 
    {

    }
}