export class PressMgr 
{
    /**界面的canvas */
    private m_stCanvas: cc.Node;

    constructor() 
    {
        this.Init();
    }

    private Init(): void 
    {
        this.m_stCanvas = cc.find('Canvas');
    }

    /**
     * 战斗界面绑定事件
     */
    public BindEvent(): void 
    {
        this.m_stCanvas.on(cc.Node.EventType.MOUSE_DOWN,this.OnMouseUpHandler.bind(this));
    }

    private OnMouseUpHandler(event): void 
    {
        // 左下角为(0,0)
        console.log("鼠标点击的位置是",event.getLocation());

        // test 
        let my = cc.find('Canvas').getChildByName('my');
        my.active = true;
        my.position = new cc.Vec2(event.getLocation().x - 960 / 2,event.getLocation().y - 640 / 2);
    }
}