import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {HookSkill} from "../skill/tickSkill/HookSkill";
import {SpeedUpSkill} from "../skill/tickSkill/SpeedUpSkill";
import {Unit} from "../common/Unit";

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
            // node.position = node.position.add(new cc.Vec2(0, speed));
            let rot = node.rotation / 180 * Math.PI;
            let vec = new cc.Vec2(Math.sin(rot), Math.cos(rot));
            node.position = node.position.add(vec.mul(speed));
        }
        else if(moveType == eMoveType.DOWN) 
        {
            // node.position = node.position.add(new cc.Vec2(0, -speed));
            let rot = node.rotation / 180 * Math.PI;
            let vec = new cc.Vec2(Math.sin(rot), Math.cos(rot));
            node.position = node.position.sub(vec.mul(speed));
        }
        else if(moveType == eMoveType.LEFT) 
        {
            // node.position = node.position.add(new cc.Vec2(-speed, 0));
            node.rotation -= 5;
        }
        else if(moveType == eMoveType.Right) 
        {
            // node.position = node.position.add(new cc.Vec2(speed, 0));
            node.rotation += 5;
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
        if(heroID == CoreConfig.MY_HERO_ID) 
        {
            // 使播放cd动画
            Core.GameLogic.SkillMgr.GoInCD(btnID);
            // 使恢复正常状态
            Core.GameLogic.SkillMgr.GoNormalState(btnID);
        }

        // 各个技能逻辑处理 
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
     * 让指定id的单位生命值发生变化
     * @param unitID 单位id
     * @param hpChange 生命值的变化，可正可负
     */
    public UnitHPChange(unitID: number, hpChange: number): void 
    {
        let unit = Core.GameLogic.UnitMgr.GetUnitByID(unitID);
        unit.NowHP += hpChange;
    }

    /**
     * 钩子技能
     */
    private SkillHook(heroID: number, pos: cc.Vec2): void 
    {
        let hero = this.GetNodeByID(heroID);
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