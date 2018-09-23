import {CoreConfig} from "./CoreConfig";
import Core from "./Core";

export enum eProtocolType 
{
    MOVE = 0,
    SKILL = 1,
    LOGIN = 2,
    OTHER = 3
}

export class Protocol 
{
    /**协议头 */
    private m_sTitle: eProtocolType;
    /**协议内容 */
    private m_stContent: any;

    protected constructor(title: eProtocolType, content: any)
    {
        this.m_sTitle = title;
        this.m_stContent = content;
    }
}

export class NetMgr
{
    constructor() 
    {

    }

    public SendMessage(protoType: eProtocolType, content: any): void 
    {
        // 单机模式下，把消息丢给TickMgr的消息队列
        if(CoreConfig.SINGLE_MODEL)
        {
            Core.TickMgr.PushMessage(protoType, content);
        }
        else 
        {
            // 联机模式下，向服务器发送消息
        }
    }
}