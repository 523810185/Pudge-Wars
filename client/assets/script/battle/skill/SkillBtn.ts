import {BaseTicker} from "../../common/BaseTicker";
import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";

export class SkillBtn implements BaseTicker
{
    /**按钮节点 */
    private m_stBtn: cc.Node;
    /**Sprite组件 */
    private m_stSprite: cc.Sprite;
    /**内部的Sprite组件 */
    private m_stInnerSprite: cc.Sprite;
    /**是否处于cd状态 */
    private m_bInCD: boolean;
    /**cd长短 */
    private m_iCDLength: number;
    /**cd计时器 */
    private m_iCDCnt: number;
    /**使用次数 */
    private m_iUseCnt: number;

    constructor(btn: cc.Node)
    {
        this.m_stBtn = btn;
        this.m_bInCD = false;
        this.m_iCDLength = 0;
        this.m_stSprite = this.m_stBtn.getComponent(cc.Sprite);
        this.m_stInnerSprite = this.m_stBtn.children[0].getComponent(cc.Sprite);
        this.m_stBtn.zIndex = CoreConfig.Z_INDEX_UI;
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

    /**
     * 设置该技能的使用次数和cd
     * @param useCnt 如果次数为1，默认cd为0；如果次数为-1，表示可以无限制的使用
     * @param cdLength 技能的cd，必须非负
     */
    public SetUseCnt(useCnt: number, cdLength: number): void 
    {
        if(useCnt > 1 || useCnt == -1) 
        {
            this.CDLength = cdLength;
        }
        else 
        {
            this.CDLength = 0;
        }
        this.m_iUseCnt = useCnt;
    }

    /**
     * 使进入技能cd。
     * 返回的布尔值表示，使用次数是否已经耗尽
     */
    public GoInCD(): boolean 
    {
        // cd重置条件：cd大于0且使用次数不是1
        if(this.m_iCDLength > 0 && this.m_iUseCnt != 1) 
        {
            this.m_bInCD = true;
            this.m_iCDCnt = 0;
        }

        // 次数逻辑
        if(this.m_iUseCnt == -1) 
        {
            // 次数-1表示可以无限制的使用
            return false;
        }
        else 
        {
            this.m_iUseCnt--;
            return this.m_iUseCnt == 0;
        }
    }

    /**使进入被选择状态 */
    public GoInClickState(): void 
    {
        this.m_stBtn.opacity = 100;
    }

    /**使返回正常状态 */
    public GoInNormalState(): void 
    {
        this.m_stBtn.opacity = 255;
    }

    /**
     * 设置技能图标
     * @param url 图标的url（相对于texture/skill/的路径）
     */
    public SetSkillAvatar(url: string): void 
    {
        Core.ResourceMgr.LoadRes("texture/skill/" + url, (res) =>
        {
            this.m_stSprite.spriteFrame = new cc.SpriteFrame(res);
            this.m_stInnerSprite.spriteFrame = new cc.SpriteFrame(res);
        });
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