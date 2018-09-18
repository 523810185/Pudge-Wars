import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {NodePool} from "../../common/NodePool";

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
    /**钩子的单位池 */
    private m_stHookChainPool: NodePool;
    /**钩头的单位池 */
    private m_stHookPool: NodePool;

    constructor()
    {
        this.Init();
    }

    private Init(): void 
    {
        // 找到舞台
        this.m_stCanvas = cc.find("Canvas");
        // 初始化足够的hook 
        Core.ResourceMgr.LoadRes("prefabs/hookchain", (res) =>
        {
            this.m_stHookChainPool = new NodePool(1000, res);
            console.log("钩子单位池准备完毕！");
        });
        Core.ResourceMgr.LoadRes("prefabs/hook", (res) =>
        {
            this.m_stHookPool = new NodePool(50, res);
        });
    }

    /**
     * 英雄移动
     * @param heroID 英雄id 
     * @param moveType 方向类型
     */
    public HeroMove(heroID: number, moveType: eMoveType): void 
    {
        let node = this.GetNodeByID(heroID);
        if(moveType == eMoveType.UP) 
        {
            node.position = node.position.add(new cc.Vec2(0, 10));
        }
        else if(moveType == eMoveType.DOWN) 
        {
            node.position = node.position.add(new cc.Vec2(0, -10));
        }
        else if(moveType == eMoveType.LEFT) 
        {
            node.position = node.position.add(new cc.Vec2(-10, 0));
        }
        else if(moveType == eMoveType.Right) 
        {
            node.position = node.position.add(new cc.Vec2(10, 0));
        }
    }

    /**
     * 英雄释放技能
     * @param heroID 释放技能的英雄的id
     * @param skillID 技能的id
     * @param pos 技能释放的坐标点
     */
    public HeroSkill(heroID: number, skillID: number, pos: cc.Vec2): void 
    {
        if(skillID == CoreConfig.SKILL_HOOK) 
        {
            this.SkillHook(heroID, pos);
        }
    }

    /**
     * 计算从vec(0,1.0)到vec之间的角度
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

    /**
     * 钩子技能
     */
    private SkillHook(heroID: number, pos: cc.Vec2): void 
    {
        let hero = Core.GameLogic.ObjMgr.GetNodeByID(CoreConfig.TEST_HERO_ID);
        let itemLength = 15;
        let hookCnt = pos.sub(hero.position).mag() / itemLength - 1;
        let vec: cc.Vec2 = pos.sub(hero.position);
        let hookhead: cc.Node = this.m_stHookPool.CheckOut();
        let angle: number;
        angle = this.CalcAngle(vec);
        this.m_stCanvas.addChild(hookhead);

        hookhead.rotation = angle;

        for(let i = 1;i <= hookCnt;i++) 
        {
            let hookPos = hero.position.add(vec.mul(1.0 / hookCnt * i));
            let nowPos = hero.position.add(vec.mul(1.0 / hookCnt * (i - 1)));

            let hook: cc.Node = this.m_stHookChainPool.CheckOut();
            setTimeout(() =>
            {

                hookhead.position = hookPos;
            }, 50 * i);
            setTimeout(() =>
            {
                hookhead.position = hookPos;
            }, 50 * 2 * hookCnt - (i - 1) * 50);


            setTimeout(() =>
            {

                this.m_stCanvas.addChild(hook);
                hook.position = nowPos;
            }, 50 * i);
            setTimeout(() =>
            {
                this.m_stHookChainPool.CheckIn(hook);
            }, 50 * 2 * hookCnt - (i - 1) * 50);
        }
        setTimeout(() =>
        {
            this.m_stHookPool.CheckIn(hookhead);
        }, hookCnt * 50 * 2);


    }

    private GetNodeByID(nodeID: number): cc.Node
    {
        let node = Core.GameLogic.ObjMgr.GetNodeByID(nodeID);
        return node;
    }
} 