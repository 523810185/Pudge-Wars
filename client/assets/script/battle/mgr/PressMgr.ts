import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {eMoveType} from "./ActionMgr";
import {eProtocolType} from "../../core/NetMgr";

enum eClickState 
{
    NONE = 0,
    SKILL_ONE = 1,
    SKILL_TWO = 2,
    SKILL_THREE = 3
}

export class PressMgr 
{
    /**界面的canvas */
    private m_stCanvas: cc.Node;

    /**鼠标当前点击的状态 */
    private m_iClickState: number = eClickState.NONE;

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

    /**处理鼠标点击事件 */
    private OnClickDownHandler(event): void 
    {
        // 左下角为(0,0)
        let clickPos: cc.Vec2 = event.getLocation();
        // x，y都保留3位小数
        clickPos.x = ((clickPos.x * 1000) >> 0) / 1000;
        clickPos.y = ((clickPos.y * 1000) >> 0) / 1000;
        console.log("鼠标点击的位置是", clickPos, event.getLocation());

        if(this.m_iClickState == eClickState.NONE) 
        {
            return;
        }
        else if(this.m_iClickState == eClickState.SKILL_ONE) 
        {
            let realPos: cc.Vec2 = new cc.Vec2(clickPos.x - CoreConfig.CANVAS_WIDTH / 2, clickPos.y - CoreConfig.CANVAS_HEIGHT / 2);
            let content = {
                unitID: CoreConfig.TEST_HERO_ID,
                skillID: CoreConfig.SKILL_HOOK,
                pos: realPos
            };
            Core.NetMgr.SendMessage(eProtocolType.SKILL, content);
            // Core.GameLogic.ActionMgr.HeroSkill(CoreConfig.TEST_HERO_ID, CoreConfig.SKILL_HOOK, realPos);
        }

        this.m_iClickState = eClickState.NONE;
    }

    /**处理键盘按键事件 */
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
            case cc.macro.KEY.z:
                this.m_iClickState = eClickState.SKILL_ONE;
                break;
            case cc.macro.KEY.x:
                let content = {
                    unitID: CoreConfig.TEST_HERO_ID,
                    skillID: CoreConfig.SKILL_SPEED_UP
                };
                Core.NetMgr.SendMessage(eProtocolType.SKILL, content);
                break
        }
    }
}