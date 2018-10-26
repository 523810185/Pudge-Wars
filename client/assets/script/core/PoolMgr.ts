import {NodePool} from "../common/NodePool";
import Core from "./Core";

export class PoolMgr 
{
    private m_mapPoolMgr: Map<string, NodePool>;

    constructor() 
    {
        this.Init();
    }

    /**
     * 注册一个指定的单位池
     * @param poolName 用来查找的单位池的名字
     * @param url 资源的位置
     * @param poolMaxNumber 池的最大容量
     */
    public RegisterPool(poolName: string, url: string, poolMaxNumber: number): void 
    {
        Core.ResourceMgr.LoadRes(url, (res) =>
        {
            let pool: NodePool = new NodePool(poolMaxNumber, res);
            this.m_mapPoolMgr.set(poolName, pool);
        });
    }

    /**
     * 根据名字返回特定的单位池
     * @param poolName 单位池的名字
     */
    public GetPoolByName(poolName: string): NodePool 
    {
        if(!this.m_mapPoolMgr.has(poolName)) 
        {
            cc.error("尝试向PoolMgr拿取一个不存在的单位池，请检查逻辑，poolName：", poolName);
            return null;
        }

        return this.m_mapPoolMgr.get(poolName);
    }

    private Init(): void 
    {
        this.m_mapPoolMgr = new Map<string, NodePool>();
    }
}