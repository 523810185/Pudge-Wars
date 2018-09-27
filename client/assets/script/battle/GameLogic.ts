import {PressMgr} from "./mgr/PressMgr";
import {UnitMgr} from "./mgr/UnitMgr";
import {ActionMgr} from "./mgr/ActionMgr";
import Core from "../core/Core";
import {CoreConfig} from "../core/CoreConfig";
import {SkillMgr} from "./mgr/SkillMgr";
import {Unit, eType} from "./common/Unit";

export class GameLogic 
{
    /**舞台，也是所有物体的父节点 */
    private m_stCanvas: cc.Node;
    /**点击事件管理者 */
    private m_pPressMgr: PressMgr;
    /**所有的活物体管理者 */
    private m_pUnitMgr: UnitMgr;
    /**动作管理者 */
    private m_pActionMgr: ActionMgr;
    /**技能管理器 */
    private m_pSkillMgr: SkillMgr;

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
        this.m_pUnitMgr = new UnitMgr();
        this.m_pActionMgr = new ActionMgr();
        this.m_pSkillMgr = new SkillMgr();
    }

    /**初始化游戏逻辑 */
    public StartGame(args?: any): void 
    {
        this.m_pPressMgr.BindEvent();

        if(args) 
        {
            // test 创建英雄
            Core.ResourceMgr.LoadRes("prefabs/hero", (res: cc.Prefab) =>
            {
                for(let id of args) 
                {
                    let node = cc.instantiate(res);
                    this.m_stCanvas.addChild(node);
                    if(id == 0) 
                    {
                        node.position = new cc.Vec2(-200, 0);
                    }
                    else 
                    {
                        node.position = new cc.Vec2(200, 0);
                    }
                    this.m_pUnitMgr.InsertUnit(id, new Unit(node, eType.Hero).Init(10, 100));
                }
                console.log("英雄已经被创建！");
            });
        }
        else 
        {
            // test 创建英雄 --> 自己
            Core.ResourceMgr.LoadRes("prefabs/hero", (res: cc.Prefab) =>
            {
                let node = cc.instantiate(res);
                console.log("test英雄已经被创建！");
                this.m_stCanvas.addChild(node);
                node.position = new cc.Vec2(0, 0);
                this.m_pUnitMgr.InsertUnit(CoreConfig.MY_HERO_ID, new Unit(node, eType.Hero).Init(10, 100));
            });

            // --> 敌人
            Core.ResourceMgr.LoadRes("prefabs/hero", (res: cc.Prefab) =>
            {
                let node = cc.instantiate(res);
                console.log("test敌人已经被创建！");
                this.m_stCanvas.addChild(node);
                node.position = new cc.Vec2(Math.random() * CoreConfig.CANVAS_WIDTH / 2, Math.random() * CoreConfig.CANVAS_HEIGHT / 2);
                this.m_pUnitMgr.InsertUnit(CoreConfig.TEST_ANIME_ID, new Unit(node, eType.Hero).Init(10, 100));
            });
        }

        // test 技能cd部分显示
        this.m_pSkillMgr.Awake();
        this.m_pSkillMgr.SetCDLength(1, 3);
    }

    public get PressMgr(): PressMgr 
    {
        return this.m_pPressMgr;
    }
    public get UnitMgr(): UnitMgr
    {
        return this.m_pUnitMgr;
    }
    public get ActionMgr(): ActionMgr 
    {
        return this.m_pActionMgr;
    }
    public get SkillMgr(): SkillMgr 
    {
        return this.m_pSkillMgr;
    }
}