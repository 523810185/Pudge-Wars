import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {NodePool} from "../../common/NodePool";
import {HookSkill} from "../skill/tickSkill/HookSkill";
import {Unit} from "./UnitMgr";
import {SpeedUpSkill} from "../skill/tickSkill/SpeedUpSkill";
import {ShowToast} from "../../common/Toast";

export enum eMoveType
{
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    Right = 3
}

export class ActionMgr 
{
    /**舞台，也是所有物体的父节点 */
    private m_stCanvas: cc.Node;

    constructor()
    {
        this.Init();
    }

    private Init(): void 
    {
        // 找到舞台
        this.m_stCanvas = cc.find("Canvas");
    }

    /**
     * 英雄移动
     * @param heroID 英雄id 
     * @param moveType 方向类型
     */
    public HeroMove(heroID: number, moveType: eMoveType): void 
    {
        let speed = this.GetUnitByID(heroID).Speed;
        let node = this.GetNodeByID(heroID);
        if(moveType == eMoveType.UP) 
        {
            node.position = node.position.add(new cc.Vec2(0, speed));
        }
        else if(moveType == eMoveType.DOWN) 
        {
            node.position = node.position.add(new cc.Vec2(0, -speed));
        }
        else if(moveType == eMoveType.LEFT) 
        {
            node.position = node.position.add(new cc.Vec2(-speed, 0));
        }
        else if(moveType == eMoveType.Right) 
        {
            node.position = node.position.add(new cc.Vec2(speed, 0));
        }
    }

    /**
     * 英雄释放技能
     * @param btnID 按钮的id
     * @param heroID 释放技能的英雄的id
     * @param skillID 技能的id
     * @param pos 技能释放的坐标点
     */
    public HeroSkill(btnID: number, heroID: number, skillID: number, pos?: cc.Vec2): void 
    {
        // 如果处于cd状态，则直接返回
        if(Core.GameLogic.SkillMgr.IsInCD(btnID)) 
        {
            ShowToast("技能没有准备好！");
            return;
        }

        Core.GameLogic.SkillMgr.GoInCD(btnID);
        if(skillID == CoreConfig.SKILL_HOOK) 
        {
            this.SkillHook(heroID, pos);
        }
        else if(skillID == CoreConfig.SKILL_SPEED_UP) 
        {
            this.SpeedUp(heroID);
        }
    }

    /**
     * 钩子技能
     */
    private SkillHook(heroID: number, pos: cc.Vec2): void 
    {
        let hero = this.GetNodeByID(CoreConfig.TEST_HERO_ID);
        let skillPos = hero.position; // 释放技能者的位置
        let vec = pos.sub(skillPos).normalize();

        let ticker = new HookSkill(hero, skillPos, vec);
        Core.TickMgr.AddTicker(ticker);
    }

    /**加速技能 */
    private SpeedUp(heroID: number) 
    {
        let unit = this.GetUnitByID(heroID);

        let ticker = new SpeedUpSkill(unit);
        Core.TickMgr.AddTicker(ticker);
    }

    private

    private GetNodeByID(unitID: number): cc.Node
    {
        let unit = Core.GameLogic.UnitMgr.GetUnitByID(unitID);
        return unit.GetNode();
    }

    private GetUnitByID(unitID: number): Unit
    {
        return Core.GameLogic.UnitMgr.GetUnitByID(unitID);
    }
} 