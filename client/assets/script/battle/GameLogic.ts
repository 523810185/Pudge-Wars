import {PressMgr} from "./mgr/PressMgr";
import {ObjMgr} from "./mgr/ObjMgr";

export class GameLogic 
{
    /**点击事件管理者 */
    private m_pPressMgr: PressMgr;
    /**所有的活物体管理者 */
    private m_pObjMgr: ObjMgr;

    public constructor() 
    {
        this.Init();
    }

    private Init(): void 
    {
        this.m_pPressMgr = new PressMgr();
        this.m_pObjMgr = new ObjMgr();
    }

    /**初始化游戏逻辑 */
    public StartGame(): void 
    {
        this.m_pPressMgr.BindEvent();
    }

    public get PressMgr(): PressMgr 
    {
        return this.m_pPressMgr;
    }
    public get ObjMgr(): ObjMgr
    {
        return this.m_pObjMgr;
    }
}