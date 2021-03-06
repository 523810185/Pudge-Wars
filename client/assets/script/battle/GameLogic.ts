import {OperationMgr} from "./mgr/OperationMgr";
import {UnitMgr} from "./mgr/UnitMgr";
import {ActionMgr} from "./mgr/ActionMgr";
import Core from "../core/Core";
import {CoreConfig} from "../core/CoreConfig";
import {SkillMgr} from "./mgr/SkillMgr";
import {Unit, eUnitType, eUnitTeam} from "./common/Unit";
import {ThingMgr} from "./mgr/ThingMgr";
import {EventID} from "../core/EventID";
import {GameOverMsg} from "../common/message/EventMsg";
import {ServerRequestMgr} from "./mgr/ServerRequestMgr";

export class GameLogic 
{
    /**舞台，也是所有物体的父节点 */
    private m_stCanvas: cc.Node;
    /**玩家游戏内操作事件管理者 */
    private m_pOperationMgr: OperationMgr;
    /**所有的活物体管理者 */
    private m_pUnitMgr: UnitMgr;
    /**动作管理者 */
    private m_pActionMgr: ActionMgr;
    /**技能管理器 */
    private m_pSkillMgr: SkillMgr;
    /**拾取物品管理器 */
    private m_pThingMgr: ThingMgr;
    /**服务器请求管理器 */
    private m_pServerRequestMgr: ServerRequestMgr;

    public constructor() 
    {
        this.Init();
    }

    private Init(): void 
    {
        // 找到舞台
        this.m_stCanvas = cc.find('Canvas');

        // 初始化管理者
        this.m_pOperationMgr = new OperationMgr();
        this.m_pUnitMgr = new UnitMgr();
        this.m_pActionMgr = new ActionMgr();
        this.m_pSkillMgr = new SkillMgr();
        this.m_pThingMgr = new ThingMgr();
        this.m_pServerRequestMgr = new ServerRequestMgr();

        // TODO... 游戏结束后该内存的清除工作
        new GameOverHandler();
    }

    /**初始化游戏逻辑 */
    public StartGame(args?: any): void 
    {
        this.m_pOperationMgr.BindEvent();

        if(args) 
        {
            // test 创建英雄
            for(let id of args) 
            {
                let node = Core.PoolMgr.GetPoolByName("pudge").CheckOut();
                this.m_stCanvas.addChild(node);
                if(id == 0) // TODO ... 去掉魔法数字
                {
                    node.position = new cc.Vec2(-200, 0);
                }
                else 
                {
                    node.position = new cc.Vec2(200, 0);
                }
                this.m_pUnitMgr.InsertUnit(id, new Unit(node, eUnitType.Hero, id == 0 ? eUnitTeam.Red : eUnitTeam.Blue).Init(5, 30, 100));
            }
            console.log("英雄已经被创建！");
        }
        else 
        {
            // test 创建英雄 --> 自己
            let node = Core.PoolMgr.GetPoolByName("pudge").CheckOut();
            console.log("test英雄已经被创建！");
            this.m_stCanvas.addChild(node);
            node.position = new cc.Vec2(0, 0);
            this.m_pUnitMgr.InsertUnit(CoreConfig.MY_HERO_ID, new Unit(node, eUnitType.Hero, eUnitTeam.Red).Init(5, 30, 100, 10));

            // --> 敌人
            node = Core.PoolMgr.GetPoolByName("pudge").CheckOut();
            console.log("test敌人已经被创建！");
            this.m_stCanvas.addChild(node);
            node.position = new cc.Vec2(Math.random() * CoreConfig.CANVAS_WIDTH / 2, Math.random() * CoreConfig.CANVAS_HEIGHT / 2);
            this.m_pUnitMgr.InsertUnit(CoreConfig.TEST_ANIME_ID, new Unit(node, eUnitType.Hero, eUnitTeam.Blue).Init(5, 30, 100));
        }

        // test 技能cd部分显示
        this.m_pSkillMgr.Awake();
        // this.m_pSkillMgr.SetCDLength(1, 3);
    }

    public get OperationMgr(): OperationMgr 
    {
        return this.m_pOperationMgr;
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
    public get ThingMgr(): ThingMgr
    {
        return this.m_pThingMgr;
    }
    public get ServerRequestMgr(): ServerRequestMgr 
    {
        return this.m_pServerRequestMgr;
    }
}

class GameOverHandler
{
    constructor()
    {
        this.Init();
    }

    private Init(): void 
    {
        this.BindEvent();
    }

    private BindEvent(): void 
    {
        Core.EventMgr.BindEvent(EventID.GAME_OVER, this.OnGameOverHandler, this);
    }

    /**游戏结束的处理 */
    private OnGameOverHandler(data: GameOverMsg): void 
    {
        let teamMask = data.WinnerTeamMask;
        Core.GameLogic.ServerRequestMgr.ReqGameOver(teamMask);
    }
}