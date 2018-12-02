export class EventMgr 
{
    /**储存事件的map */
    private m_mapEventMap: Map<number, Map<any, Function>>;

    constructor()
    {
        this.Init();
    }

    private Init(): void
    {
        this.m_mapEventMap = new Map<number, Map<any, Function>>();
    }

    /**
     * 绑定事件
     * @param eventID 事件id
     * @param cbStruct 回调函数的结构体（不直接使用function是为了通用性，不想依赖于js的语言特性：把funciton作为头等公民）
     * @param caller 作用域
     */
    public BindEvent(eventID: number, callback: Function, caller: any): void
    {
        let eventMap: Map<any, Function> = this.m_mapEventMap.get(eventID);
        if(eventMap == null)
        {
            eventMap = new Map<any, Function>();
            eventMap.set(caller, callback);
            this.m_mapEventMap.set(eventID, eventMap);
        }
        else
        {
            if(eventMap.has(caller)) 
            {
                cc.warn("EventMgr：正在注册一个已经存在的事件。eventID:", eventID);
            }
            else 
            {
                eventMap.set(caller, callback);
            }
        }
    }

    /**
     * 解绑事件
     * @param eventID 事件id
     * @param caller 作用域
     */
    public UnbindEvent(eventID: number, caller: Object): void
    {
        let eventMap = this.m_mapEventMap.get(eventID);
        if(eventMap == null)
        {
            cc.warn("EventMgr：正在解绑一个已经不存在的事件。eventID:", eventID);
        }
        else
        {
            if(eventMap.has(caller)) 
            {
                eventMap.delete(caller);
            }
            else 
            {
                cc.warn("EventMgr：正在解绑一个已经不存在的结构体。eventID:", eventID);
            }
        }
    }

    /**
     * 丢出一个事件
     * @param eventID 事件id
     * @param data 数据
     */
    public Emit(eventID: number, data: EventMsg): void
    {
        let eventMap = this.m_mapEventMap.get(eventID);
        if(eventMap == null)
        {
            cc.warn("EventMgr：正在发送数据给一个已经未注册的事件。eventID:", eventID);
        }
        else
        {
            eventMap.forEach((callback: Function, caller: Object) =>
            {
                // TODO.. 这两种有什么差异，以后需要去学习一下，但是至少现在ResMgr和EventMgr的两种方式工作情况都是没问题的
                callback.call(caller, data);
                // callback(data);
            });
        }
    }
}

/**
 * 废弃的方案。
 * 本来不直接使用function是为了通用性，不想依赖于js的语言特性：把funciton作为头等公民
 * 但是，这样发现写在外部类很多地方没办法调用到类内部的成员，反而更加繁琐
 * 那么，还是采用js回调函数的方案。
 * 反观例如java那样的语言，可以采用以下方案，而且本身存在内部类方便调用，
 * 对于c++而言，也可以采用诸如友元类的方式来处理。
 */
// export interface EventCallBackStruct 
// {
//     /**回调函数 */
//     DoFunction(data: EventMsg): void;
// }

export interface EventMsg 
{

}