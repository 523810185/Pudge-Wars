export class ObjMgr 
{
    // TODO: 封装Obj
    private m_stNodeMap: Map<number, cc.Node>;

    constructor() 
    {
        this.m_stNodeMap = new Map<number, cc.Node>();
    }

    /**
     * 将一个物体插入
     * @param nodeID 物体的id
     * @param node 物体本身
     */
    public InsertNode(nodeID: number, node: cc.Node): void 
    {
        if(this.m_stNodeMap.get(nodeID)) 
        {
            cc.error("ObjMgr填入了一个已经存在的id，请检查逻辑。id为", nodeID);
        }
        else 
        {
            this.m_stNodeMap.set(nodeID, node);
        }
    }

    /**
     * 通过id获得对应的node
     * @param nodeID node的ID
     */
    public GetNodeByID(nodeID: number): cc.Node 
    {
        let node = this.m_stNodeMap.get(nodeID);
        if(!node) 
        {
            cc.error("ObjMgr申请了一个不存在的NodeID，请检查逻辑。id为", nodeID);
        }
        else 
        {
            return node;
        }
    }
}