import Core from "./core/Core";
import {eMessageHead} from "./core/NetMgr";
import {CoreConfig} from "./core/CoreConfig";

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
    /**默认的蓝色背景 */
    private m_stDefaultBackground: cc.Node;
    /**游戏是否开始 */
    private m_bIsStart: boolean = false;

    start()
    {
        Core.Init();
        this.GetCanvasNode();
        this.UIAdapter();
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
        this.m_stDefaultBackground = this.canvas.getChildByName('default_background');
    }

    /**
     * 适配
     */
    private UIAdapter(): void 
    {
        console.log("当前屏幕的宽度和高度为，", this.canvas.width, this.canvas.height);
        CoreConfig.CANVAS_WIDTH = this.canvas.width;
        CoreConfig.CANVAS_HEIGHT = this.canvas.height;
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
        if(CoreConfig.SINGLE_MODEL) 
        {
            this.StartGame();
        }
        else 
        {
            Core.NetMgr.EmitMsgToServer(eMessageHead.LOGIN_MESSAGE, "");
        }
        // this.canvas.active = false;
        // this.HideMainUI();
        // this.StartGame();
    }

    /**
     * 隐藏主界面的UI
     */
    private HideMainUI(): void
    {
        this.m_stLogo.active = false;
        this.m_stBtnStartGame.active = false;
        this.m_stDefaultBackground.active = false;
    }

    /**
     * 显示战斗场景的背景
     */
    private ShowBattleBackground(): void 
    {
        this.m_stBackground.active = true;
        this.m_stBackground.zIndex = CoreConfig.Z_INDEX_BACKGROUND;
    }

    /**
     * 开始游戏
     */
    public StartGame(args?: any): void 
    {
        this.HideMainUI();
        this.ShowBattleBackground();
        Core.GameLogic.StartGame(args);
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
