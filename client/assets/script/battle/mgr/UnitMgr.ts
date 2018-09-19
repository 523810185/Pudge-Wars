export enum eType 
{
    Hero = 0,
    Building = 1,
    Other = 2
}

export class Unit 
{
    constructor(node: cc.Node, eType: eType)  
    {
        this.m_stNode = node;
        this.m_eType = eType;
    }

    /**节点本身 */
    private m_stNode: cc.Node;
    /**节点类型 */
    private m_eType: eType;

    public get Type(): eType 
    {
        return this.m_eType;
    }

    public set Type(eType: eType) 
    {
        this.m_eType = eType;
    }

    /**得到单位节点 */
    public GetNode(): cc.Node 
    {
        return this.m_stNode;
    }
}

export class UnitMgr 
{
    private m_stUnitMap: Map<number, Unit>;
    private m_stUnitArray: Array<Unit>;

    constructor() 
    {
        this.m_stUnitMap = new Map<number, Unit>();
        this.m_stUnitArray = new Array<Unit>();
    }

    public get UnitArray(): Array<Unit> 
    {
        return this.m_stUnitArray;
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
            this.m_stUnitArray.push(unit);
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