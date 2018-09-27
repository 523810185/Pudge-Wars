import {eTickMessageType} from "./NetMgr";
import Core from "./Core";
import {BaseTicker} from "../common/BaseTicker";
import {CoreConfig} from "./CoreConfig";
import {eMoveType} from "../battle/mgr/ActionMgr";

export class TickMgr 
{
    /**单机下的信息，只要接受到就立刻在update中执行 */
    private m_stArrForMove: Array<any>;
    private m_stArrForSkill: Array<any>;

    /**一帧的时间 */
    private readonly TICK_TIME: number = 1.0 / 60;

    /**每帧中执行的 */
    private m_stArrForTickUpdater: Array<BaseTicker>;
    /**非某帧中执行的 */
    private m_stArrForNormalTicker: Array<BaseTicker>;

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
    public AddTicker(ticker: BaseTicker): void 
    {
        this.m_stArrForTickUpdater.push(ticker);
    }

    /**
     * 将某个仅需要随着时间更新的单位丢进队列，以在之后的被更新。如果需要按帧更新，请调用AddTicker方法
     * @param ticker 需要在帧更新的单位
     */
    public AddNormalTicker(ticker: BaseTicker): void 
    {
        this.m_stArrForNormalTicker.push(ticker);
    }

    constructor() 
    {
        this.m_stArrForMove = new Array<any>();
        this.m_stArrForSkill = new Array<any>();
        this.m_stArrForTickUpdater = new Array<BaseTicker>();
        this.m_stArrForNormalTicker = new Array<BaseTicker>();
    }

    /**在单机中被调用的更新，请不要在单机模式以外的地方调用此函数 */
    public Update(dt: number): void 
    {
        // if(CoreConfig.SINGLE_MODEL == false)
        // {
        //     return;
        // }

        // 单机可以立刻更新的部分
        for(let content of this.m_stArrForSkill) 
        {
            let btnID = content.btnID;
            let unitID = content.unitID;
            let skillID: number = content.skillID;
            let pos: cc.Vec2 = content.pos;
            if(pos) 
            {
                Core.GameLogic.ActionMgr.HeroSkill(btnID, unitID, skillID, pos);
            }
            else 
            {
                Core.GameLogic.ActionMgr.HeroSkill(btnID, unitID, skillID);
            }
        }
        for(let content of this.m_stArrForMove) 
        {
            let unitID = content.unitID;
            let moveType = content.moveType;
            Core.GameLogic.ActionMgr.HeroMove(unitID, moveType);
        }

        // 非帧更新
        for(let i = this.m_stArrForNormalTicker.length - 1; i >= 0; i--) 
        {
            let item = this.m_stArrForNormalTicker[i];
            item.Update();
            if(item.IsFinished()) 
            {
                // 如果已经完毕，则移除
                let len = this.m_stArrForNormalTicker.length;
                let temp = this.m_stArrForNormalTicker[len - 1];
                this.m_stArrForNormalTicker[len - 1] = this.m_stArrForNormalTicker[i];
                this.m_stArrForNormalTicker[i] = temp;
                this.m_stArrForNormalTicker.pop();
                item.Clear();
            }
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
     * 将帧消息传递给TickMgr，仅限于在单机下模拟跑帧同步
     * @param msgType 帧消息类型
     * @param content 帧消息内容
     */
    public PushTickMessage(msgType: eTickMessageType, content: any): void 
    {
        if(msgType == eTickMessageType.MOVE) 
        {
            this.m_stArrForMove.push(content);
        }
        else if(msgType == eTickMessageType.SKILL) 
        {
            this.m_stArrForSkill.push(content);
        }
        else if(msgType == eTickMessageType.HP_CHANGE) 
        {
            let unitID = content.unitID;
            let hpChange = content.hpChange;
            Core.GameLogic.ActionMgr.UnitHPChange(unitID, hpChange);
        }
    }

    /**返回一帧的时间 */
    public OneTickTime(): number 
    {
        return this.TICK_TIME;
    }
}