import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import {FloatNumHandler} from "../../../common/FloatNumHandler";

export class AvatarSkill implements BaseTicker 
{
    /**持续时间（单位：帧） */
    private readonly DURATION_TIME: number = 60 * 5;
    /**生长百分比（0~1.0） */
    private readonly GROW_PERCENT: number = 0.5;
    /**变化时间（单位：帧） */
    private readonly GROW_TIME: number = 60 * 0.8;

    /**施法单位 */
    private m_stUnit: Unit;
    /**生长速度（每帧） */
    private m_iGrowSpeed: number;
    /**计时器 */
    private m_iTickCnt: number;
    /**魔免需要变化 */
    private m_bNeedChangeMI: boolean;

    constructor(unit: Unit) 
    {
        this.m_stUnit = unit;
        this.Init();
    }

    private Init(): void 
    {
        this.m_iTickCnt = 0;
        this.m_iGrowSpeed = this.m_stUnit.GetNode().scale * (this.GROW_PERCENT / this.GROW_TIME);
        this.m_iGrowSpeed = FloatNumHandler.PreservedTo(this.m_iGrowSpeed);

        // 魔免
        this.m_bNeedChangeMI = !this.m_stUnit.IsMagicImmunity;
        this.m_stUnit.IsMagicImmunity = true;
        // 不死
        this.m_stUnit.AddHPChangeListener(this.UnDead, this);
    }

    /**不会死亡的函数 */
    private UnDead(hpChange: number): void 
    {
        if(!this.m_stUnit.IsAlive) 
        {
            this.m_stUnit.NowHP = 1;
        }
    }

    Update(): void 
    {
        this.m_iTickCnt++;
        if(this.m_iTickCnt <= this.GROW_TIME) 
        {
            this.m_stUnit.GetNode().scale += this.m_iGrowSpeed;
        }
        else if(this.m_iTickCnt > this.DURATION_TIME - this.GROW_TIME) 
        {
            this.m_stUnit.GetNode().scale -= this.m_iGrowSpeed;
        }
    }

    IsFinished(): boolean 
    {
        return this.m_iTickCnt >= this.DURATION_TIME;
    }

    Clear(): void
    {
        // 魔免
        if(this.m_bNeedChangeMI) 
        {
            this.m_stUnit.IsMagicImmunity = false;
        }
        // 不死
        this.m_stUnit.RemoveHPChangeListener(this);
    }
}