import {NodePool} from "../common/NodePool";
import Core from "./Core";

export class PoolMgr 
{
    /**钩子的单位池 */
    private m_stHookChainPool: NodePool;
    /**钩头的单位池 */
    private m_stHookHeadPool: NodePool;
    /**Toast的单位池 */
    private m_stToastPool: NodePool;
    /**hpBar的单位池 */
    private m_stHPBarPool: NodePool;
    /**可拾取物品的单位池 */
    private m_stThingsPool: NodePool;

    public GetHookChainPool(): NodePool 
    {
        return this.m_stHookChainPool;
    }

    public GetHookHeadPool(): NodePool 
    {
        return this.m_stHookHeadPool;
    }

    public GetToastPool(): NodePool 
    {
        return this.m_stToastPool;
    }

    public GetHPBarPool(): NodePool 
    {
        return this.m_stHPBarPool;
    }

    public GetThingsPool(): NodePool 
    {
        return this.m_stThingsPool;
    }

    constructor() 
    {
        this.Init();
    }

    private Init(): void 
    {
        // 初始化足够的hook 
        Core.ResourceMgr.LoadRes("prefabs/hookChain", (res) =>
        {
            this.m_stHookChainPool = new NodePool(1000, res);
            console.log("钩子单位池准备完毕！");
        });
        Core.ResourceMgr.LoadRes("prefabs/hookHead", (res) =>
        {
            this.m_stHookHeadPool = new NodePool(30, res);
        });
        Core.ResourceMgr.LoadRes("prefabs/Toast", (res) =>
        {
            this.m_stToastPool = new NodePool(30, res);
        });
        Core.ResourceMgr.LoadRes("prefabs/hpBar", (res) =>
        {
            this.m_stHPBarPool = new NodePool(30, res);
        });
        Core.ResourceMgr.LoadRes("prefabs/things", (res) =>
        {
            this.m_stThingsPool = new NodePool(100, res);
        });
    }
}