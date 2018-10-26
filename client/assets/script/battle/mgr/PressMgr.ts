import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {eMoveType} from "./ActionMgr";
import {eTickMessageType} from "../../core/NetMgr";
import {ShowToast} from "../../common/Toast";
import {eSkillStateNext} from "./SkillMgr";

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
        this.m_stCanvas.on(cc.Node.EventType.MOUSE_DOWN, this.OnClickDownHandler.bind(this));
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

        /*if(event.getButton() == cc.Event.EventMouse.BUTTON_RIGHT)
        {
            let realPos: cc.Vec2 = new cc.Vec2(clickPos.x - CoreConfig.CANVAS_WIDTH / 2, clickPos.y - CoreConfig.CANVAS_HEIGHT / 2);
            let content = {
                unitID: CoreConfig.MY_HERO_ID,
                endPos: realPos
            };
            Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
        }
        else */if(this.m_iClickState == eClickState.NONE) 
        {
            return;
        }
        else 
        {
            let realPos: cc.Vec2 = new cc.Vec2(clickPos.x - CoreConfig.CANVAS_WIDTH / 2, clickPos.y - CoreConfig.CANVAS_HEIGHT / 2);
            let content = {
                btnID: this.m_iClickState,
                unitID: CoreConfig.MY_HERO_ID,
                skillID: Core.GameLogic.SkillMgr.GetSkillIDByBtnID(this.m_iClickState),
                pos: realPos
            };
            Core.NetMgr.SendTickMessage(eTickMessageType.SKILL, content);
            // Core.GameLogic.ActionMgr.HeroSkill(CoreConfig.TEST_HERO_ID, CoreConfig.SKILL_HOOK, realPos);
        }

        this.m_iClickState = eClickState.NONE;
    }

    /**处理键盘按键事件 */
    private OnKeyDownHandler(event): void 
    {
        let content: any;
        let nextState: eSkillStateNext;
        switch(event.keyCode) 
        {
            case cc.macro.KEY.w:
                // if(CoreConfig.SINGLE_MODEL) 
                // {
                //     Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.UP);
                // }
                content = {
                    unitID: CoreConfig.MY_HERO_ID,
                    moveType: eMoveType.UP
                };
                Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
                break;
            case cc.macro.KEY.s:
                // if(CoreConfig.SINGLE_MODEL) 
                // {
                //     Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.DOWN);
                // }
                content = {
                    unitID: CoreConfig.MY_HERO_ID,
                    moveType: eMoveType.DOWN
                };
                Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
                break;
            case cc.macro.KEY.a:
                // if(CoreConfig.SINGLE_MODEL) 
                // {
                //     Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.LEFT);
                // }
                content = {
                    unitID: CoreConfig.MY_HERO_ID,
                    moveType: eMoveType.LEFT
                };
                Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
                break;
            case cc.macro.KEY.d:
                // if(CoreConfig.SINGLE_MODEL) 
                // {
                //     Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.Right);
                // }
                content = {
                    unitID: CoreConfig.MY_HERO_ID,
                    moveType: eMoveType.Right
                };
                Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
                break;
            case cc.macro.KEY.z:
                this.OnClickSkillBtn(eClickState.SKILL_ONE);
                break;
            case cc.macro.KEY.x:
                this.OnClickSkillBtn(eClickState.SKILL_TWO);
                break;
            case cc.macro.KEY.c:
                this.OnClickSkillBtn(eClickState.SKILL_THREE);
        }
    }

    /**
     * 响应按下某个技能
     * @param btnID 技能按钮的id
     */
    private OnClickSkillBtn(btnID: eClickState): void 
    {
        let nextState = Core.GameLogic.SkillMgr.GetSkillStateNext(btnID);
        if(nextState == eSkillStateNext.NULL) 
        {
            ShowToast("你尚未拥有该技能！");
        }
        else if(nextState == eSkillStateNext.IN_CD) 
        {
            ShowToast("技能没有准备好！");
        }
        else if(nextState == eSkillStateNext.TO_GO) 
        {
            let content = {
                btnID: btnID,
                unitID: CoreConfig.MY_HERO_ID,
                skillID: Core.GameLogic.SkillMgr.GetSkillIDByBtnID(btnID)
            };
            Core.NetMgr.SendTickMessage(eTickMessageType.SKILL, content);
        }
        else if(nextState == eSkillStateNext.TO_CHOOSE_STATE)
        {
            Core.GameLogic.SkillMgr.GoClickState(btnID);
            this.m_iClickState = btnID;
        }
    }
}