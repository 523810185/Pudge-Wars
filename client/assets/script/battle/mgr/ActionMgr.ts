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
    private m_stHookHeadPool: NodePool;

    constructor()
    {
        this.Init();
    }

    private Init(): void 
    {
        // 找到舞台
        this.m_stCanvas = cc.find("Canvas");
        // 初始化足够的hook 
        Core.ResourceMgr.LoadRes("prefabs/hookChain", (res) =>
        {
            this.m_stHookChainPool = new NodePool(1000, res);
            console.log("钩子单位池准备完毕！");
        });
        Core.ResourceMgr.LoadRes("prefabs/hookHead", (res) =>
        {
            this.m_stHookHeadPool = new NodePool(50, res);
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
     * 得到被钩的节点
     * @param hero 释放技能的单位
     * @param hookHead 钩头
     */
    private GetHookedHero(hero: cc.Node, hookHead: cc.Node): cc.Node
    {
        let hookedNode: cc.Node = null;
        let hookDis: number = 40;
        let unitArray = Core.GameLogic.UnitMgr.UnitArray;
        let minDis: number = -1;
        for(let item of unitArray) 
        {
            if(hero == item.GetNode())
            {
                continue;
            }

            let dis: number = item.GetNode().position.sub(hookHead.position).mag();
            if(dis > hookDis) 
            {
                continue;
            }

            if(minDis < 0) 
            {
                minDis = dis;
                hookedNode = item.GetNode();
            }
            else if(minDis > dis) 
            {
                minDis = dis;
                hookedNode = item.GetNode();
            }
        }
        return hookedNode;
    }

    /**
     * 钩子技能
     */
    private SkillHook(heroID: number, pos: cc.Vec2): void 
    {
        let hero = this.GetNodeByID(CoreConfig.TEST_HERO_ID);
        let skillPos = hero.position; // 释放技能者的位置
        let itemLength = 15; // 一个钩子的长度
        let maxLen = 450;    // 钩子延伸的最长长度
        let hookCnt = (maxLen / itemLength) >> 0; // 钩子的个数
        let vec: cc.Vec2 = pos.sub(skillPos).normalize(); // 方向向量的单位向量
        let hookArr: Array<cc.Node> = []; // hookChain的集合
        let hookHead: cc.Node = this.m_stHookHeadPool.CheckOut();
        let angle: number;
        angle = this.CalcAngle(vec);
        this.m_stCanvas.addChild(hookHead);

        // 钩头朝向设置
        hookHead.rotation = angle;
        // 初始化钩头位置
        hookHead.position = skillPos;

        // 是否处于返回期
        let isReturn: boolean = false;
        // 被钩到的单位
        let hookedNode: cc.Node = null;

        let tickTime: number = 50 / 1000; // 每帧的时间(s)
        let timer: cc.Component = new cc.Component();
        timer.schedule(() =>
        {
            if(isReturn) 
            {
                if(hookArr.length == 0) 
                {
                    this.m_stHookHeadPool.CheckIn(hookHead);
                    timer.unscheduleAllCallbacks();
                }
                else 
                {
                    let lastHookChain = hookArr.pop();
                    hookHead.position = lastHookChain.position;

                    // 钩单位逻辑处理
                    if(!hookedNode) 
                    {
                        hookedNode = this.GetHookedHero(hero, hookHead);
                    }
                    else 
                    {
                        hookedNode.position = hookHead.position;
                    }

                    // 归还最后一节hookChain
                    this.m_stHookChainPool.CheckIn(lastHookChain);
                }
            }
            else 
            {
                if(hookArr.length == hookCnt) 
                {
                    isReturn = true;

                    // 归还最后一节hookChain
                    let lastHookChain = hookArr.pop();
                    hookHead.position = lastHookChain.position;
                    if(hookedNode != null) 
                    {
                        hookedNode.position = lastHookChain.position;
                    }
                    this.m_stHookChainPool.CheckIn(lastHookChain);
                }
                else 
                {
                    let newHookChain = this.m_stHookChainPool.CheckOut();
                    this.m_stCanvas.addChild(newHookChain);
                    hookArr.push(newHookChain);
                    newHookChain.position = skillPos.add(vec.mul(itemLength * hookArr.length));
                    hookHead.position = skillPos.add(vec.mul(itemLength * (hookArr.length + 1)));
                }

                // 钩单位逻辑处理
                if(hookedNode == null) 
                {
                    hookedNode = this.GetHookedHero(hero, hookHead);
                    if(hookedNode != null) 
                    {
                        isReturn = true;
                    }
                }
                else 
                {
                    cc.warn("钩子技能逻辑出错啦！");
                    hookedNode.position = hookHead.position;
                }
            }
        }, tickTime, hookCnt * 2);
    }

    private GetNodeByID(unitID: number): cc.Node
    {
        let unit = Core.GameLogic.UnitMgr.GetUnitByID(unitID);
        return unit.GetNode();
    }
} 