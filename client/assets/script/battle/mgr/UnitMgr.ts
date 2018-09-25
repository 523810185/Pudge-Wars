import {Unit} from "../common/Unit";

export class UnitMgr 
{
    private m_stUnitMap: Map<number, Unit>;

    constructor() 
    {
        this.m_stUnitMap = new Map<number, Unit>();
    }

    /**用get方法是保护性拷贝 */
    public get UnitMap(): Map<number, Unit>
    {
        return this.m_stUnitMap;
    }

    /**
     * 将一个物体插入
     * @param nodeID 物体的id
     * @param unit 物体本身
     */
    public InsertNode(nodeID: number, unit: Unit): void 
    {
        if(this.m_stUnitMap.get(nodeID)) 
        {
            cc.error("UnitMgr填入了一个已经存在的id，请检查逻辑。id为", nodeID);
        }
        else 
        {
            this.m_stUnitMap.set(nodeID, unit);
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