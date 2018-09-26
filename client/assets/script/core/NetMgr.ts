import {CoreConfig} from "./CoreConfig";
import Core from "./Core";

export enum eTickMessageType 
{
    MOVE = 0,
    SKILL = 1,
    OTHER = 3,
    HP_CHANGE = 4
}

export enum eMessageHead 
{
    TICK_MESSAGE = "tick"
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
            console.log("接到帧消息：", data);

            let str = JSON.parse(data);
            for(let item of str) 
            {
                console.log("--", item);
                this.HandleTickData(item);
            }

            Core.TickMgr.UpdateTicker();
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
            let pos: cc.Vec2 = new cc.Vec2(content.pos.x, content.pos.y);
            if(pos) 
            {
                Core.GameLogic.ActionMgr.HeroSkill(btnID, unitID, skillID, pos);
            }
            else 
            {
                Core.GameLogic.ActionMgr.HeroSkill(btnID, unitID, skillID);
            }
        }
        else if(head == eTickMessageType.MOVE) 
        {
            let unitID = content.unitID;
            let moveType = content.moveType;
            Core.GameLogic.ActionMgr.HeroMove(unitID, moveType);
        }
        else if(head == eTickMessageType.HP_CHANGE) 
        {
            // TODO 封装
            let unitID = content.unitID;
            let hpChange = content.hpChange;
            let unit = Core.GameLogic.UnitMgr.GetUnitByID(unitID);
            unit.NowHP += hpChange;
        }
    }
}