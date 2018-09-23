import Core from "./core/Core";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Entrance extends cc.Component
{
    @property(cc.Node)
    private canvas: cc.Node = null;

    /**开始按钮 */
    private m_stBtnStartGame: cc.Node;
    /**logo */
    private m_stLogo: cc.Node;
    /**背景 */
    private m_stBackground: cc.Node;
    /**游戏是否开始 */
    private m_bIsStart: boolean = false;

    start()
    {
        Core.Init();
        this.GetCanvasNode();
        this.BindEvent();
    }

    /**
     * 得到主界面的节点信息
     */
    private GetCanvasNode(): void 
    {
        this.m_stBtnStartGame = this.canvas.getChildByName('btn_start');
        this.m_stLogo = this.canvas.getChildByName('logo');
        this.m_stBackground = this.canvas.getChildByName('background');
    }

    /**
     * 绑定节点的事件
     */
    private BindEvent(): void 
    {
        this.m_stBtnStartGame.on(cc.Node.EventType.TOUCH_END, this.OnClickStartGameHandler.bind(this));
    }

    /**
     * 点击开始按钮
     */
    private OnClickStartGameHandler(): void 
    {
        // this.canvas.active = false;
        this.HideMainUI();
        this.StartGame();
    }

    /**
     * 隐藏主界面的UI
     */
    private HideMainUI(): void
    {
        this.m_stLogo.active = false;
        this.m_stBtnStartGame.active = false;
    }

    /**
     * 开始游戏
     */
    private StartGame(): void 
    {
        Core.GameLogic.StartGame();
        this.m_bIsStart = true;
    }

    update(dt: number): void 
    {
        if(!this.m_bIsStart) 
        {
            return;
        }

        Core.TickMgr.Update(dt);
    }

}
