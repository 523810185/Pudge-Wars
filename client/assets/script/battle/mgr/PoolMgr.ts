import {NodePool} from "../../common/NodePool";
import Core from "../../core/Core";

export class PoolMgr 
{
    /**钩子的单位池 */
    private m_stHookChainPool: NodePool;
    /**钩头的单位池 */
    private m_stHookHeadPool: NodePool;

    public GetHookChainPool(): NodePool 
    {
        return this.m_stHookChainPool;
    }

    public GetHookHeadPool(): NodePool 
    {
        return this.m_stHookHeadPool;
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
            this.m_stHookHeadPool = new NodePool(50, res);
        });
    }
}