import {Unit} from "../common/Unit";

export class UnitMgr 
{
    private m_stUnitMap: Map<number, Unit>;

    constructor() 
    {
        this.m_stUnitMap = new Map<number, Unit>();
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
     * @param unidID 单位的id
     * @param unit 单位本身
     */
    public InsertUnit(unidID: number, unit: Unit): void 
    {
        if(this.m_stUnitMap.get(unidID)) 
        {
            cc.error("UnitMgr填入了一个已经存在的id，请检查逻辑。id为", unidID);
        }
        else 
        {
            this.m_stUnitMap.set(unidID, unit);
        }
    }

    /**
     * 删除一个单位
     * @param unitID 单位的id 
     */
    public RemoveUnit(unitID: number): void 
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
}