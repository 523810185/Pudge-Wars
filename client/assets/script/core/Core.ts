import {GameLogic} from "../battle/GameLogic";
import {ResourceMgr} from "./ResourceMgr";
import {NetMgr} from "./NetMgr";

export default class Core
{
    private static m_pGameLogic: GameLogic;
    private static m_pResourceMgr: ResourceMgr;
    private static m_pNetMgr: NetMgr;

    public static Init(): void 
    {
        this.m_pResourceMgr = new ResourceMgr();
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
}
