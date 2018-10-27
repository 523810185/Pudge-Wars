export class NodePool
{
    /**单位池的尺寸 */
    private m_iSize: number;
    /**单位池本身 */
    private m_stPool: Array<cc.Node>;
    /**单位原型 */
    private m_stProto: cc.Prefab;

    // TODO ... 改成object的pool
    constructor(poolSize: number, prefab: cc.Prefab)
    {
        this.m_iSize = poolSize;
        this.m_stProto = prefab;
        this.m_stPool = [];
        for(let i = 0; i < poolSize; i++) 
        {
            let node = cc.instantiate(prefab);
            this.m_stPool.push(node);
        }
    }

    /**从单位池获取节点 */
    public CheckOut(): cc.Node
    {
        if(this.m_stPool.length == 0) 
        {
            cc.error("单位池已经为空却还在索求单位，请检查逻辑！单位的名字为：", this.m_stProto.name);
            return null;
        }
        else 
        {
            let node = this.m_stPool[this.m_stPool.length - 1];
            this.m_stPool.pop();
            return node;
        }
    }

    /**将节点归还单位池 */
    public CheckIn(node: cc.Node): void 
    {
        // 在归还前node需要做必要的清空操作
        node.parent = null;
        node.zIndex = 0;
        node.opacity = 255;
        this.m_stPool.push(node);
    }
}