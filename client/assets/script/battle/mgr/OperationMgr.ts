import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {eMoveType} from "./ActionMgr";
import {eTickMessageType} from "../../core/NetMgr";
import {ShowToast} from "../../common/Toast";
import {eSkillStateNext, eClickResult} from "./SkillMgr";
import {FloatNumHandler} from "../../common/FloatNumHandler";

enum eClickState 
{
    NONE = 0,
    SKILL_ONE = 1,
    SKILL_TWO = 2,
    SKILL_THREE = 3
}

export class OperationMgr 
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

    /**
     * 战斗界面取消绑定事件
     */
    public UnBindEvent(): void 
    {
        this.m_stCanvas.off(cc.Node.EventType.MOUSE_DOWN, this.OnClickDownHandler.bind(this));
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.OnKeyDownHandler, this);
    }

    /**处理鼠标点击事件 */
    private OnClickDownHandler(event): void 
    {
        // 左下角为(0,0)
        let clickPos: cc.Vec2 = event.getLocation();
        // x，y都保留3位小数
        clickPos.x = FloatNumHandler.PreservedTo(clickPos.x);
        clickPos.y = FloatNumHandler.PreservedTo(clickPos.y);
        console.log("鼠标点击的位置是", clickPos, event.getLocation());

        if(event.getButton() == cc.Event.EventMouse.BUTTON_RIGHT)
        {
            let realPos: cc.Vec2 = new cc.Vec2(clickPos.x - CoreConfig.CANVAS_WIDTH / 2, clickPos.y - CoreConfig.CANVAS_HEIGHT / 2);
            let content = {
                unitID: CoreConfig.MY_HERO_ID,
                endPos: realPos
            };
            Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
        }
        else  // 左键点击的处理
        {
            this.OnMouseLeftClickHandler(clickPos);
        }
    }

    /**处理键盘按键事件 */
    private OnKeyDownHandler(event): void 
    {
        let content: any;
        switch(event.keyCode) 
        {
            // case cc.macro.KEY.w:
            //     // if(CoreConfig.SINGLE_MODEL) 
            //     // {
            //     //     Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.UP);
            //     // }
            //     content = {
            //         unitID: CoreConfig.MY_HERO_ID,
            //         moveType: eMoveType.UP
            //     };
            //     Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
            //     break;
            // case cc.macro.KEY.s:
            //     // if(CoreConfig.SINGLE_MODEL) 
            //     // {
            //     //     Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.DOWN);
            //     // }
            //     content = {
            //         unitID: CoreConfig.MY_HERO_ID,
            //         moveType: eMoveType.DOWN
            //     };
            //     Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
            //     break;
            // case cc.macro.KEY.a:
            //     // if(CoreConfig.SINGLE_MODEL) 
            //     // {
            //     //     Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.LEFT);
            //     // }
            //     content = {
            //         unitID: CoreConfig.MY_HERO_ID,
            //         moveType: eMoveType.LEFT
            //     };
            //     Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
            //     break;
            // case cc.macro.KEY.d:
            //     // if(CoreConfig.SINGLE_MODEL) 
            //     // {
            //     //     Core.GameLogic.ActionMgr.HeroMove(CoreConfig.TEST_HERO_ID, eMoveType.Right);
            //     // }
            //     content = {
            //         unitID: CoreConfig.MY_HERO_ID,
            //         moveType: eMoveType.Right
            //     };
            //     Core.NetMgr.SendTickMessage(eTickMessageType.MOVE, content);
            //     break;
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

    /**
     * 处理鼠标左键点击
     */
    private OnMouseLeftClickHandler(clickPos: cc.Vec2): void 
    {
        if(this.m_iClickState == eClickState.NONE) 
        {
            return;
        }
        else 
        {
            let clickResult = Core.GameLogic.SkillMgr.GetSkillClickResult(this.m_iClickState, clickPos);
            // 处理点击成功
            if(clickResult.m_eClickResult == eClickResult.ACCEPT_CLICK_OPERATION) 
            {
                // 如果是非指向型技能，则直接发送位置消息给服务器
                if(clickResult.m_stClickUnitID == -1) 
                {
                    let realPos: cc.Vec2 = new cc.Vec2(clickPos.x - CoreConfig.CANVAS_WIDTH / 2, clickPos.y - CoreConfig.CANVAS_HEIGHT / 2);
                    let content = {
                        btnID: this.m_iClickState,
                        unitID: CoreConfig.MY_HERO_ID,
                        skillID: Core.GameLogic.SkillMgr.GetSkillIDByBtnID(this.m_iClickState),
                        pos: realPos
                    };
                    Core.NetMgr.SendTickMessage(eTickMessageType.SKILL, content);
                }
                else // 指向型
                {
                    let content = {
                        btnID: this.m_iClickState,
                        unitID: CoreConfig.MY_HERO_ID,
                        skillID: Core.GameLogic.SkillMgr.GetSkillIDByBtnID(this.m_iClickState),
                        clickUnitID: clickResult.m_stClickUnitID
                    };
                    Core.NetMgr.SendTickMessage(eTickMessageType.SKILL, content);
                }
                // 成功点击，将点击状态还原
                this.m_iClickState = eClickState.NONE;
            }
            else 
            {
                this.HandleSkillClickError(clickResult.m_eClickResult);
            }
        }
    }

    /**
     * 处理技能点击错误
     */
    private HandleSkillClickError(err: eClickResult): void 
    {
        if(err == eClickResult.CLICK_BUILDING) 
        {
            ShowToast("不能以建筑为目标");
        }
        else if(err == eClickResult.CLICK_ENEMY) 
        {
            ShowToast("不能以敌人为目标");
        }
        else if(err == eClickResult.CLICK_FRIENDLY_FORCE) 
        {
            ShowToast("不能以友军为目标");
        }
        else if(err == eClickResult.CLICK_MAGIC_IMMUNITY_UNIT) 
        {
            ShowToast("不能以魔免单位为目标");
        }
        else if(err == eClickResult.CLICK_MYSELF) 
        {
            ShowToast("不能以自己为目标");
        }
        else if(err == eClickResult.NEED_CHOOSE_UNIT) 
        {
            ShowToast("请选择一个单位");
        }
    }
}