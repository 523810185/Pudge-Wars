import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";

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
        this.m_stCanvas.on(cc.Node.EventType.TOUCH_START,this.OnClickDownHandler.bind(this));
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.OnKeyDownHandler,this);
    }

    private OnClickDownHandler(event): void 
    {
        // 左下角为(0,0)
        console.log("鼠标点击的位置是",event.getLocation());

        // test 
        let hero = Core.GameLogic.ObjMgr.GetNodeByID(CoreConfig.TEST_HERO_ID);
        let realPos: cc.Vec2 = new cc.Vec2(event.getLocation().x - CoreConfig.CANVAS_WIDTH / 2,event.getLocation().y - CoreConfig.CANVAS_HEIGHT / 2);
        let itemLength = 15;
        let hookCnt = realPos.sub(hero.position).mag() / itemLength;
        let vec: cc.Vec2 = realPos.sub(hero.position);
        Core.ResourceMgr.LoadRes("prefabs/hook",(res) =>
        {
            for(let i = 1;i <= hookCnt;i++) 
            {
                let nowPos = hero.position.add(vec.mul(1.0 / hookCnt * i));

                let hook: cc.Node = cc.instantiate(res);
                setTimeout(() =>
                {

                    this.m_stCanvas.addChild(hook);
                    hook.position = nowPos;
                },200 * i);
                setTimeout(() =>
                {
                    hook.destroy();
                },200 * 2 * hookCnt - (i - 1) * 200);
            }
        });

    }

    private OnKeyDownHandler(event): void 
    {
        // TODO: 转移到ActionMgr中
        let hero: cc.Node = Core.GameLogic.ObjMgr.GetNodeByID(CoreConfig.TEST_HERO_ID);
        switch(event.keyCode) 
        {
            case cc.macro.KEY.w:
                hero.position = new cc.Vec2(hero.position.x,hero.position.y + 10);
                break;
            case cc.macro.KEY.s:
                hero.position = new cc.Vec2(hero.position.x,hero.position.y - 10);
                break;
            case cc.macro.KEY.a:
                hero.position = new cc.Vec2(hero.position.x - 10,hero.position.y);
                break;
            case cc.macro.KEY.d:
                hero.position = new cc.Vec2(hero.position.x + 10,hero.position.y);
                break;
        }
    }
}