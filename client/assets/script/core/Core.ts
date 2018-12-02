import {GameLogic} from "../battle/GameLogic";
import {ResourceMgr} from "./ResourceMgr";
import {NetMgr} from "./NetMgr";
import {TickMgr} from "./TickMgr";
import {PoolMgr} from "./PoolMgr";
import {EventMgr} from "./EventMgr";

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
    /**事件管理器 */
    private static m_pEventMgr: EventMgr;

    public static Init(): void 
    {
        // 根据各单例之间的引用关系来决定初始化顺序
        this.m_pResourceMgr = new ResourceMgr();
        this.m_pEventMgr = new EventMgr();
        this.m_pTickMgr = new TickMgr();
        this.m_pNetMgr = new NetMgr();
        this.m_pPoolMgr = new PoolMgr();
        this.m_pGameLogic = new GameLogic();

        // 对某些单例进行注册或者需要的初始化
        this.RegisterNodePool();
    }

    /**
     * 注册需要的单位池
     */
    private static RegisterNodePool(): void 
    {
        this.m_pPoolMgr.RegisterPool("hookChain", "prefabs/hookChain", 1000);
        this.m_pPoolMgr.RegisterPool("hookHead", "prefabs/hookHead", 30);
        this.m_pPoolMgr.RegisterPool("Toast", "prefabs/Toast", 30);
        this.m_pPoolMgr.RegisterPool("hpBar", "prefabs/hpBar", 30);
        this.m_pPoolMgr.RegisterPool("things", "prefabs/things", 100);
        this.m_pPoolMgr.RegisterPool("pudge", "prefabs/pudge", 100);
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
    public static get EventMgr(): EventMgr
    {
        return this.m_pEventMgr;
    }
}
