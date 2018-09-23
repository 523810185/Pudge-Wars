import {GameLogic} from "../battle/GameLogic";
import {ResourceMgr} from "./ResourceMgr";
import {NetMgr} from "./NetMgr";
import {TickMgr} from "./TickMgr";

export default class Core
{
    private static m_pGameLogic: GameLogic;
    private static m_pResourceMgr: ResourceMgr;
    private static m_pNetMgr: NetMgr;
    private static m_pTickMgr: TickMgr;

    public static Init(): void 
    {
        // 根据各单例之间的引用关系来决定初始化顺序
        this.m_pResourceMgr = new ResourceMgr();
        this.m_pTickMgr = new TickMgr();
        this.m_pNetMgr = new NetMgr();
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
}
