import {GameLogic} from "../battle/GameLogic";
import {ResourceMgr} from "./ResourceMgr";
import {NetMgr} from "./NetMgr";
import {TickMgr} from "./TickMgr";
import {PoolMgr} from "./PoolMgr";

export default class Core
{
    /**游戏逻辑 */
    private static m_pGameLogic: GameLogic;
    /**资源加载管理器 */
    private static m_pResourceMgr: ResourceMgr;
    /**联网管理器 */
    private static m_pNetMgr: NetMgr;
    /**帧管理者 */
    private static m_pTickMgr: TickMgr;
    /**管理一些常用物体的单位池 */
    private static m_pPoolMgr: PoolMgr;

    public static Init(): void 
    {
        // 根据各单例之间的引用关系来决定初始化顺序
        this.m_pResourceMgr = new ResourceMgr();
        this.m_pTickMgr = new TickMgr();
        this.m_pNetMgr = new NetMgr();
        this.m_pPoolMgr = new PoolMgr();
        this.m_pGameLogic = new GameLogic();
    }

    public static get GameLogic(): GameLogic 
    {
        return Core.m_pGameLogic;
    }
    public static get ResourceMgr(): ResourceMgr 
    {
        return this.m_pResourceMgr;
    }
    public static get NetMgr(): NetMgr 
    {
        return this.m_pNetMgr;
    }
    public static get TickMgr(): TickMgr 
    {
        return this.m_pTickMgr;
    }
    public static get PoolMgr(): PoolMgr 
    {
        return this.m_pPoolMgr;
    }
}
