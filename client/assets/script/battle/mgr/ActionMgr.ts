import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {HookSkill} from "../skill/tickSkill/HookSkill";
import {SpeedUpSkill} from "../skill/tickSkill/SpeedUpSkill";
import {Unit} from "../common/Unit";
import {MoveToSkill} from "../skill/tickSkill/MoveToSkill";
import {BaseTicker} from "../../common/BaseTicker";
import {FloatNumHandler} from "../../common/FloatNumHandler";
import {FireAroundSkill} from "../skill/tickSkill/FireAroundSkill";

/**准备被废弃的移动方案 */
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
    /**MoveMgr */
    private m_stMoveMgr: MoveMgr;

    constructor()
    {
        this.Init();
    }

    private Init(): void 
    {
        // 找到舞台
        this.m_stCanvas = cc.find("Canvas");

        this.m_stMoveMgr = new MoveMgr();
        Core.TickMgr.AddTicker(this.m_stMoveMgr);
    }

    /**
     * 英雄移动
     * @param heroID 英雄id
     * @param endPos 移动到的位置
     */
    public HeroMove(heroID: number, endPos: cc.Vec2) 
    {
        this.m_stMoveMgr.UnitMove(heroID, endPos);
    }

    // /**
    //  * 英雄移动
    //  * @param heroID 英雄id 
    //  * @param moveType 方向类型
    //  */
    // public HeroMove(heroID: number, moveType: eMoveType): void 
    // {
    //     let speed = this.GetUnitByID(heroID).Speed;
    //     let node = this.GetNodeByID(heroID);
    //     if(moveType == eMoveType.UP) 
    //     {
    //         // node.position = node.position.add(new cc.Vec2(0, speed));
    //         let rot = node.rotation / 180 * Math.PI;
    //         let vec = new cc.Vec2(Math.sin(rot), Math.cos(rot));
    //         node.position = node.position.add(vec.mul(speed));
    //     }
    //     else if(moveType == eMoveType.DOWN) 
    //     {
    //         // node.position = node.position.add(new cc.Vec2(0, -speed));
    //         let rot = node.rotation / 180 * Math.PI;
    //         let vec = new cc.Vec2(Math.sin(rot), Math.cos(rot));
    //         node.position = node.position.sub(vec.mul(speed));
    //     }
    //     else if(moveType == eMoveType.LEFT) 
    //     {
    //         // node.position = node.position.add(new cc.Vec2(-speed, 0));
    //         node.rotation -= 5;
    //     }
    //     else if(moveType == eMoveType.Right) 
    //     {
    //         // node.position = node.position.add(new cc.Vec2(speed, 0));
    //         node.rotation += 5;
    //     }
    // }

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
        else if(skillID == CoreConfig.SKILL_FIRE_AROUND) 
        {
            this.SkillFireAround(heroID);
        }
        else 
        {
            console.log(heroID, "释放的技能为", skillID);
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

        let ticker = new HookSkill(this.GetUnitByID(heroID), skillPos, vec);
        Core.TickMgr.AddTicker(ticker);
    }

    /**
     * 灼烧技能
     */
    private SkillFireAround(unitID: number): void 
    {
        let ticker = new FireAroundSkill(this.GetUnitByID(unitID));
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

// 隶属于ActionMgr的管理类
class MoveMgr implements BaseTicker
{
    private m_mapMoveUnits: Map<number, cc.Vec2>;

    constructor() 
    {
        this.Init();
    }

    private Init(): void 
    {
        this.m_mapMoveUnits = new Map<number, cc.Vec2>();
    }

    /**
     * 单位向某个位置移动的指令
     * @param unitID 单位id
     * @param moveTo 移动到的位置
     */
    public UnitMove(unitID: number, moveTo: cc.Vec2): void 
    {
        this.m_mapMoveUnits.set(unitID, moveTo);
    }

    Update(): void 
    {
        this.m_mapMoveUnits.forEach((moveTo: cc.Vec2, unitID: number) =>
        {
            let unit = Core.GameLogic.UnitMgr.GetUnitByID(unitID);
            let node = unit.GetNode();
            let dis = node.position.sub(moveTo).mag();
            dis = FloatNumHandler.PreservedTo(dis);

            // 改变朝向
            if(dis > 0.0) 
            {
                node.rotation = this.CalcAngle(moveTo.sub(node.position));
            }
            // 做出位移
            if(dis <= unit.Speed) 
            {
                node.position = moveTo;
            }
            else 
            {
                node.position = node.position.add(moveTo.sub(node.position).normalize().mul(unit.Speed));
            }
        });
    }

    IsFinished(): boolean 
    {
        return false;
    }

    Clear(): void 
    {

    }

    /**
     * 计算从vec(0,1.0)顺时针旋转到vec之间的角度
     * @param vec 向量vec2
     */
    private CalcAngle(vec: cc.Vec2): number
    {
        let angle: number;
        let temp = new cc.Vec2(0, 1.0);
        angle = vec.dot(temp) / (vec.mag() * temp.mag());

        angle = Math.acos(angle) * 180 / Math.PI;
        if(vec.x < 0) 
        {
            angle = 360 - angle;
        }
        return angle;
    }
}