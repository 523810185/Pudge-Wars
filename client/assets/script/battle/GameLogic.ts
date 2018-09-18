import {PressMgr} from "./mgr/PressMgr";
import {ObjMgr} from "./mgr/ObjMgr";
import {ActionMgr} from "./mgr/ActionMgr";
import Core from "../core/Core";
import {CoreConfig} from "../core/CoreConfig";

export class GameLogic 
{
    /**舞台，也是所有物体的父节点 */
    private m_stCanvas: cc.Node;
    /**点击事件管理者 */
    private m_pPressMgr: PressMgr;
    /**所有的活物体管理者 */
    private m_pObjMgr: ObjMgr;
    /**动作管理者 */
    private m_pActionMgr: ActionMgr;

    public constructor() 
    {
        this.Init();
    }

    private Init(): void 
    {
        // 找到舞台
        this.m_stCanvas = cc.find('Canvas');

        // 初始化管理者
        this.m_pPressMgr = new PressMgr();
        this.m_pObjMgr = new ObjMgr();
        this.m_pActionMgr = new ActionMgr();
    }

    /**初始化游戏逻辑 */
    public StartGame(): void 
    {
        this.m_pPressMgr.BindEvent();

        // test 创建一个英雄
        Core.ResourceMgr.LoadRes("prefabs/hero",(res: cc.Prefab) =>
        {
            let node = cc.instantiate(res);
            console.log("test英雄已经被创建！");
            this.m_stCanvas.addChild(node);
            node.position = new cc.Vec2(0,0);
            this.m_pObjMgr.InsertNode(CoreConfig.TEST_HERO_ID,node);
        });
    }

    public get PressMgr(): PressMgr 
    {
        return this.m_pPressMgr;
    }
    public get ObjMgr(): ObjMgr
    {
        return this.m_pObjMgr;
    }
    public get ActionMgr(): ActionMgr 
    {
        return this.m_pActionMgr;
    }
}