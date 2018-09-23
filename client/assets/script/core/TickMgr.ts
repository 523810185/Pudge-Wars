import {eProtocolType} from "./NetMgr";
import Core from "./Core";
import {BaseTickSkill} from "../battle/skill/BaseTickSkill";
import {CoreConfig} from "./CoreConfig";

export class TickMgr 
{
    /**单机下的信息，只要接受到就立刻在update中执行 */
    private m_stArrForMove: Array<any>;
    private m_stArrForSkill: Array<any>;

    /**一帧的时间 */
    private readonly TICK_TIME: number = 1.0 / 60;

    /**每帧中执行的 */
    private m_stArrForTickUpdater: Array<BaseTickSkill>;

    /**帧时间 */
    private m_iTickTime: number = 0;

    /**更新TickUpdater中的元素，希望能够在服务器帧消息到来时调用此方法 */
    public UpdateTicker(): void 
    {
        for(let i = this.m_stArrForTickUpdater.length - 1; i >= 0; i--) 
        {
            let item = this.m_stArrForTickUpdater[i];
            item.Update();
            if(item.IsFinished()) 
            {
                // 如果已经完毕，则移除
                let len = this.m_stArrForTickUpdater.length;
                let temp = this.m_stArrForTickUpdater[len - 1];
                this.m_stArrForTickUpdater[len - 1] = this.m_stArrForTickUpdater[i];
                this.m_stArrForTickUpdater[i] = temp;
                this.m_stArrForTickUpdater.pop();
                item.Clear();
            }
        }
    }

    /**
     * 将某个需要在帧更新的单位丢进队列，以在之后的帧被自动更新
     * @param ticker 需要在帧更新的单位
     */
    public AddTicker(ticker: BaseTickSkill): void 
    {
        this.m_stArrForTickUpdater.push(ticker);
    }

    constructor() 
    {
        this.m_stArrForMove = new Array<any>();
        this.m_stArrForSkill = new Array<any>();
        this.m_stArrForTickUpdater = new Array<BaseTickSkill>();
    }

    /**在单机中被调用的更新，请不要在单机模式以外的地方调用此函数 */
    public Update(dt: number): void 
    {
        if(CoreConfig.SINGLE_MODEL == false)
        {
            return;
        }

        // 单机可以立刻更新的部分
        for(let content of this.m_stArrForSkill) 
        {
            let unitID = content.unitID;
            let skillID: number = content.skillID;
            let pos: cc.Vec2 = content.pos;
            if(pos) 
            {
                Core.GameLogic.ActionMgr.HeroSkill(unitID, skillID, pos);
            }
            else 
            {
                Core.GameLogic.ActionMgr.HeroSkill(unitID, skillID);
            }
        }
        for(let content of this.m_stArrForMove) 
        {
            // TODO ...
        }

        // 帧更新
        this.m_iTickTime += dt;
        while(this.m_iTickTime >= this.TICK_TIME) 
        {
            this.m_iTickTime -= this.TICK_TIME;

            this.UpdateTicker();
        }

        // 清空该帧的消息
        while(this.m_stArrForMove.length) 
        {
            this.m_stArrForMove.pop();
        }
        while(this.m_stArrForSkill.length) 
        {
            this.m_stArrForSkill.pop();
        }
    }

    /**
     * 将消息传递给TickMgr
     * @param protoType 协议类型
     * @param content 协议内容
     */
    public PushMessage(protoType: eProtocolType, content: any): void 
    {
        if(protoType == eProtocolType.MOVE) 
        {
            this.m_stArrForMove.push(content);
        }
        else if(protoType == eProtocolType.SKILL) 
        {
            this.m_stArrForSkill.push(content);
        }
    }
} 