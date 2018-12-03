import {CoreConfig} from "./CoreConfig";
import Core from "./Core";
import Entrance from "../Entrance";
import {EventID} from "./EventID";
import {UnitSkillMsg, UnitMoveMsg, UnitHPChangeMsg, SpawnThingsMsg, PickUpThingMsg} from "../common/message/EventMsg";

export enum eTickMessageType 
{
    MOVE = 0,
    SKILL = 1,
    OTHER = 3,
    HP_CHANGE = 4,
    SPAWN_THING = 5,
    PICK_UP = 6
}

export enum eMessageHead 
{
    TICK_MESSAGE = "tick",
    LOGIN_MESSAGE = "login",
    RETURN_SKILL_THING = "return_skill_thing",
    GAME_END = "game_end"
}

/**帧消息的结构体 */
export class TickProtocol 
{
    /**协议头 */
    private m_sTitle: eTickMessageType;
    /**协议内容 */
    private m_stContent: any;

    protected constructor(title: eTickMessageType, content: any)
    {
        this.m_sTitle = title;
        this.m_stContent = content;
    }
}

declare var io;

export class NetMgr
{
    /**socket的实例，因为webSocket是持久化连接，因此只有一次连接-->这是单例 */
    private m_pSocket: any;

    constructor() 
    {
        CoreConfig.SINGLE_MODEL || this.InIt();
    }

    private InIt(): void 
    {
        // 连接服务器
        this.m_pSocket = io(CoreConfig.SERVER_HOST);
        // 监听各种类型的消息
        this.m_pSocket.on(eMessageHead.TICK_MESSAGE, (data) =>
        {
            if(data != "[]") 
            {
                console.log("接到帧消息：", data);
            }

            let arr = JSON.parse(data);
            for(let item of arr) 
            {
                console.log("--", item);
                this.HandleTickData(item);
            }

            Core.TickMgr.UpdateTicker();
        });

        this.m_pSocket.on(eMessageHead.LOGIN_MESSAGE, (data) =>
        {
            console.log("接到登录回调消息：", data);

            let obj = JSON.parse(data);
            let loginState = obj[0];
            let loginContent = obj[1];
            CoreConfig.MY_HERO_ID = loginContent.myID;

            cc.find('Canvas').getComponent(Entrance).StartGame(loginContent.idArr);
        });

        this.m_pSocket.on(eMessageHead.GAME_END, (data) =>
        {
            console.log("接到游戏结束消息：", data);

            // 游戏结束处理
            cc.find('Canvas').getComponent(Entrance).EndGame(JSON.parse(data));
        });
    }

    /**
     * 发送帧消息协议
     * @param tickMsgType 帧消息协议类型
     * @param content 帧消息协议内容
     */
    public SendTickMessage(tickMsgType: eTickMessageType, content: any): void 
    {
        // 单机模式下，把消息丢给TickMgr的消息队列
        if(CoreConfig.SINGLE_MODEL)
        {
            Core.TickMgr.PushTickMessage(tickMsgType, content);
        }
        else 
        {
            // 联机模式下，向服务器发送消息
            let message = [];
            message.push(tickMsgType);
            message.push(content);
            let jsonStr = JSON.stringify(message);

            this.EmitMsgToServer(eMessageHead.TICK_MESSAGE, jsonStr);
        }
    }

    /**
     * 发送消息给服务器
     * @param msgHead 消息头
     * @param content 消息内容
     */
    public EmitMsgToServer(msgHead: eMessageHead, content: string): void 
    {
        if(!this.m_pSocket) 
        {
            return;
        }

        this.m_pSocket.emit(msgHead, content);
    }

    /**
     * 处理服务器发来的帧消息
     * @param data 包含头和内容的obj
     */
    private HandleTickData(data: any): void 
    {
        let head = data[0];
        let content = data[1];
        console.log("tick:", head, content);

        if(head == eTickMessageType.SKILL) 
        {
            let btnID = content.btnID;
            let unitID = content.unitID;
            let skillID: number = content.skillID;
            let pos = content.pos == undefined ? null : new cc.Vec2(content.pos.x, content.pos.y);
            let clickUnitID = content.clickUnitID == undefined ? null : content.clickUnitID;
            Core.EventMgr.Emit(EventID.UNIT_SKILL, new UnitSkillMsg(btnID, unitID, skillID,
                pos, clickUnitID));
            // let btnID = content.btnID;
            // let unitID = content.unitID;
            // let skillID: number = content.skillID;
            // if(content.clickUnitID != undefined) 
            // {
            //     Core.GameLogic.ActionMgr.HeroSkill(btnID, unitID, skillID, null, content.clickUnitID)
            // }
            // else if(content.pos != undefined) 
            // {
            //     let pos: cc.Vec2 = new cc.Vec2(content.pos.x, content.pos.y);
            //     Core.GameLogic.ActionMgr.HeroSkill(btnID, unitID, skillID, pos);
            // }
            // else 
            // {
            //     Core.GameLogic.ActionMgr.HeroSkill(btnID, unitID, skillID);
            // }
        }
        else if(head == eTickMessageType.MOVE) 
        {
            let unitID = content.unitID;
            // let moveType = content.moveType;
            // Core.GameLogic.ActionMgr.HeroMove(unitID, moveType);
            let endPos = new cc.Vec2(content.endPos.x, content.endPos.y);
            // Core.GameLogic.ActionMgr.HeroMove(unitID, endPos);
            Core.EventMgr.Emit(EventID.UNIT_MOVE, new UnitMoveMsg(unitID, endPos));
        }
        else if(head == eTickMessageType.HP_CHANGE) 
        {
            let unitID = content.unitID;
            let hpChange = content.hpChange;
            // Core.GameLogic.ActionMgr.UnitHPChange(unitID, hpChange);
            Core.EventMgr.Emit(EventID.UNIT_HP_CHANGE, new UnitHPChangeMsg(unitID, hpChange));
        }
        else if(head == eTickMessageType.SPAWN_THING) 
        {
            let thingsArr: Array<any> = content.thingsArr;
            for(let item of thingsArr) 
            {
                let skillID = item.skillID;
                let thingID = item.thingID;
                let pos = new cc.Vec2(item.pos.x, item.pos.y);
                // Core.GameLogic.ThingMgr.CreateSkillThing(thingsID, skillID, pos);
                Core.EventMgr.Emit(EventID.SPAWN_THINGS, new SpawnThingsMsg(thingID, skillID, pos));
            }
        }
        else if(head == eTickMessageType.PICK_UP) 
        {
            let unitID = content.unitID;
            let thingID = content.thingID;
            // Core.GameLogic.ThingMgr.DestroyThingByID(thingID, unitID);
            Core.EventMgr.Emit(EventID.PICK_UP_THING, new PickUpThingMsg(unitID, thingID));
        }
    }
}