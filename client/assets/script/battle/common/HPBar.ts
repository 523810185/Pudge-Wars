import {BaseTicker} from "../../common/BaseTicker";
import Core from "../../core/Core";
import {Unit} from "./Unit";

export class HPBar implements BaseTicker
{
    /**目标单位 */
    private m_stUnit: Unit;
    /**hpBar的UI */
    private m_stHPBar: cc.Node;
    /**hpBar的hp部分 */
    private m_stHP: cc.Node;
    /**是否已经消失 */
    private m_bIsDestroy: boolean = false;

    /**生命值的宽度。可能有动态变化长度的需求，先预设为成员变量 */
    private m_iHPBarLength: number = 100;

    constructor(unit: Unit) 
    {
        this.m_stUnit = unit;
        this.m_stHPBar = Core.PoolMgr.GetHPBarPool().CheckOut();
        this.m_stHP = this.m_stHPBar.getChildByName("hp");
        cc.find("Canvas").addChild(this.m_stHPBar);
        // 加入Ticker
        Core.TickMgr.AddNormalTicker(this);
    }

    /**销毁这个hpBar */
    public Destroy(): void 
    {
        Core.PoolMgr.GetHPBarPool().CheckIn(this.m_stHPBar);
        this.m_bIsDestroy = true;
    }

    Update(): void 
    {
        if(this.m_bIsDestroy) 
        {
            return;
        }

        let value: number = this.m_stUnit.NowHP / this.m_stUnit.MaxHP;
        this.m_stHP.width = this.m_iHPBarLength * value;
        this.m_stHPBar.position = new cc.Vec2(this.m_stUnit.GetNode().x, this.m_stUnit.GetNode().y + 60);
    }

    IsFinished(): boolean 
    {
        return this.m_bIsDestroy;
    }

    Clear(): void 
    {

    }
}