import {BaseTicker} from "./BaseTicker";
import Core from "../../core/Core";

export class SkillBtn implements BaseTicker
{
    /**按钮节点 */
    private m_stBtn: cc.Node;
    /**Sprite组件 */
    private m_stSprite: cc.Sprite;
    /**是否处于cd状态 */
    private m_bInCD: boolean;
    /**cd长短 */
    private m_iCDLength: number;
    /**cd计时器 */
    private m_iCDCnt: number;

    constructor(btn: cc.Node)
    {
        this.m_stBtn = btn;
        this.m_bInCD = false;
        this.m_iCDLength = 0;
        this.m_stSprite = this.m_stBtn.getComponent(cc.Sprite);
    }

    /**显示技能图标 */
    public Show(): void 
    {
        this.m_stBtn.active = true;
    }

    /**隐藏技能图标 */
    public Hide(): void 
    {
        this.m_stBtn.active = false;
    }

    /**返回是否处于cd状态 */
    public get InCD(): boolean 
    {
        return this.m_bInCD;
    }

    /**设置cd长短 */
    public set CDLength(cdLength: number) 
    {
        this.m_iCDLength = cdLength;
    }

    /**使进入技能cd */
    public GoInCD(): void 
    {
        this.m_bInCD = true;
        this.m_iCDCnt = 0;
    }

    Update(): void 
    {
        if(this.m_bInCD) 
        {
            this.m_iCDCnt += Core.TickMgr.OneTickTime();
            this.m_stSprite.fillRange = this.m_iCDCnt / this.m_iCDLength;
            if(this.m_iCDCnt >= this.m_iCDLength) 
            {
                this.m_bInCD = false;
            }
        }
    }

    IsFinished(): boolean 
    {
        return false;
    }

    Clear(): void 
    {

    }
}