import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";

export class SpeedUpSkill implements BaseTicker
{
    /**完结帧号 */
    private readonly END_CNT: number = 60 * 5;
    /**附加的移动速度 */
    private readonly ADD_SPEED: number = 10;

    /**计数器 */
    private m_iNowCnt: number = 0;
    /**被加速的单位 */
    private m_stUnit: Unit;

    constructor(unit: Unit) 
    {
        this.m_stUnit = unit;
        unit.Speed += this.ADD_SPEED;
    }

    public Update(): void 
    {
        this.m_iNowCnt++;
        if(this.IsFinished()) 
        {
            this.m_stUnit.Speed -= this.ADD_SPEED;
        }
    }

    public IsFinished(): boolean 
    {
        return this.m_iNowCnt >= this.END_CNT;
    }

    public Clear(): void 
    {

    }
}