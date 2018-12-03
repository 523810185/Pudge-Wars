import {Unit, eUnitTeam} from "../common/Unit";
import Core from "../../core/Core";
import {UnitDieMsg, GameOverMsg} from "../../common/message/EventMsg";
import {EventID} from "../../core/EventID";
import {CoreConfig} from "../../core/CoreConfig";

export class UnitMgr 
{
    private m_stUnitMap: Map<number, Unit>;

    constructor() 
    {
        this.m_stUnitMap = new Map<number, Unit>();

        this.BindEvent();
    }

    private BindEvent(): void 
    {
        Core.EventMgr.BindEvent(EventID.UNIT_DIE, this.OnUnitDieHandler, this);
    }

    /**
     * 遍历UnitMgr中所有的单位
     * @param callback 遍历时执行的回调函数，返回参数为(unit: Unit, unitID: number)
     */
    public VisitUnit(callback: Function): void
    {
        this.m_stUnitMap.forEach((item, unitID) =>
        {
            callback(item, unitID);
        });
    }

    /**
     * 将一个单位插入
     * @param unitID 单位的id
     * @param unit 单位本身
     */
    public InsertUnit(unitID: number, unit: Unit): void 
    {
        if(this.m_stUnitMap.get(unitID)) 
        {
            cc.error("UnitMgr填入了一个已经存在的id，请检查逻辑。id为", unitID);
        }
        else 
        {
            this.m_stUnitMap.set(unitID, unit);
        }
    }

    /**
     * 删除一个单位
     * @param unitID 单位的id 或者 一个单位本身
     */
    public RemoveUnit(unitID: number | Unit): void 
    {
        if(unitID instanceof Unit)
        {
            let removeID: number = -1;
            this.m_stUnitMap.forEach((unit: Unit, id: number) =>
            {
                if(unit == unitID) 
                {
                    removeID = id;
                }
            });
            if(removeID == -1) 
            {
                cc.error("UnitMgr试图删除一个不存在的单位，请检查逻辑。unit:", unitID);
            }
            else 
            {
                this.m_stUnitMap.delete(removeID);
            }
        }
        else 
        {
            if(!this.m_stUnitMap.get(unitID)) 
            {
                cc.error("UnitMgr试图删除一个不存在的id，请检查逻辑。id为", unitID);
            }
            else 
            {
                this.m_stUnitMap.delete(unitID);
            }
        }
    }

    /**
     * 通过id获得对应的node
     * @param unitID node的ID
     */
    public GetUnitByID(unitID: number): Unit 
    {
        let node = this.m_stUnitMap.get(unitID);
        if(!node) 
        {
            cc.error("UnitMgr申请了一个不存在的NodeID，请检查逻辑。id为", unitID);
        }
        else 
        {
            return node;
        }
    }

    /**
     * 通过单位找到其id
     * @param unit 单位
     */
    public GetIDByUnit(findUnit: Unit): number 
    {
        let ansUnitID = -1;
        this.m_stUnitMap.forEach((unit: Unit, unitID: number) =>
        {
            if(unit == findUnit) 
            {
                ansUnitID = unitID;
            }
        });

        if(ansUnitID == -1) 
        {
            cc.error("UnitMgr: 尝试通过一个不存在的unit来获取ID，unit为：", findUnit);
        }
        else 
        {
            return ansUnitID;
        }
    }

    /**游戏结束后的清空 */
    public ClearGame(): void 
    {
        this.m_stUnitMap.forEach((unit: Unit, unitID: number) =>
        {
            unit.Clear();
        });
        this.m_stUnitMap.clear();
    }

    /**
     * 单位死亡处理
     */
    private OnUnitDieHandler(data: UnitDieMsg): void 
    {
        let dieUnitID = data.UnitID;

        // 只有当死亡单位就是本机控制的英雄时才检查阵营信息：这样可以确保只有一个人向服务器发送了结算消息
        if(CoreConfig.MY_HERO_ID != dieUnitID) 
        {
            return;
        }
        // 检查阵营信息
        let teamMask = 0;
        this.VisitUnit((unit: Unit, unitID: number) =>
        {
            if(unitID == dieUnitID) 
            {
                return;
            }

            if(unit.Team == eUnitTeam.Red) 
            {
                teamMask |= 1;
            }
            else if(unit.Team == eUnitTeam.Blue) 
            {
                teamMask |= 2;
            }
        });

        if(teamMask != 3) // 即只有一方阵营存活
        {
            Core.EventMgr.Emit(EventID.GAME_OVER, new GameOverMsg(teamMask));
        }
    }
}