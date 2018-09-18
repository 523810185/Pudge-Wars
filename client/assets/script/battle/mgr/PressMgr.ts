import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {eMoveType} from "./ActionMgr";

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
        this.m_stCanvas.on(cc.Node.EventType.TOUCH_START, this.OnClickDownHandler.bind(this));
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.OnKeyDownHandler, this);
    }

    private OnClickDownHandler(event): void 
    {
        // 左下角为(0,0)
        console.log("鼠标点击的位置是", event.getLocation());

        // test 
        let realPos: cc.Vec2 = new cc.Vec2(event.getLocation().x - CoreConfig.CANVAS_WIDTH / 2, event.getLocation().y - CoreConfig.CANVAS_HEIGHT / 2);
        Core.GameLogic.ActionMgr.HeroSkill(CoreConfig.TEST_HERO_ID, CoreConfig.SKILL_HOOK, realPos);
    }

    private OnKeyDownHandler(event): void 
    {
        switch(event.keyCode) 
        {
            case cc.macro.KEY.w:
                if(CoreConfig.SINGLE_MODEL) 
                {
                    Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.UP);
                }
                break;
            case cc.macro.KEY.s:
                if(CoreConfig.SINGLE_MODEL) 
                {
                    Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.DOWN);
                }
                break;
            case cc.macro.KEY.a:
                if(CoreConfig.SINGLE_MODEL) 
                {
                    Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.LEFT);
                }
                break;
            case cc.macro.KEY.d:
                if(CoreConfig.SINGLE_MODEL) 
                {
                    Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.Right);
                }
                break;
        }
    }
}