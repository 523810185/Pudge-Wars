import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import Core from "../../../core/Core";
import {eTickMessageType} from "../../../core/NetMgr";

export class FireAroundSkill implements BaseTicker
{
    /**效果持续的时间 */
    private readonly FIRE_TIME: number = 60 * 4;
    /**每次伤害结算时造成的伤害 */
    private readonly FIRE_DAMAGE: number = 1;
    /**多少帧结算一次伤害 */
    private readonly RESULT_TICK_CNT: number = 2;
    /**伤害半径 */
    private readonly DAMAGE_RADIUS: number = 75;
    /**火焰动画的个数 */
    private readonly FIRE_ANIMATION_CNT: number = 8;
    /**火焰一帧转动的度数 */
    private readonly FIRE_ROTATE_TICK_SPEED: number = 10;

    /**帧计时器 */
    private m_iTickCnt: number;
    /**伤害结算计时器 */
    private m_iDmgTickCnt: number;
    /**释放技能的单位 */
    private m_stUnit: Unit;

    /**火焰是否已经加载完毕 */
    private m_bFireIsLoad: boolean;
    /**火焰动画的集合 */
    private m_arrFireNode: Array<cc.Node>;

    constructor(unit: Unit)
    {
        this.m_stUnit = unit;
        this.Init();
        this.LoadRes();
    }

    private Init(): void
    {
        this.m_iTickCnt = 0;
        this.m_iDmgTickCnt = 0;
        this.m_bFireIsLoad = false;
        this.m_arrFireNode = new Array<cc.Node>();
    }

    private LoadRes(): void 
    {
        let canvas = cc.find("Canvas");
        Core.ResourceMgr.LoadRes("prefabs/littleFire", (res) =>
        {
            for(let i = 0; i < this.FIRE_ANIMATION_CNT; i++) 
            {
                let fireNode = cc.instantiate(res);
                this.m_arrFireNode.push(fireNode);
                canvas.addChild(fireNode);
                fireNode.position = this.m_stUnit.GetNode().position;
            }
            this.m_bFireIsLoad = true;
        });
    }

    /**结算伤害 */
    private ApplyDmg(): void 
    {
        Core.GameLogic.UnitMgr.VisitUnit((unit: Unit, unitID: number) =>
        {
            if(unit == this.m_stUnit) 
            {
                return;
            }

            let dis = this.m_stUnit.GetNode().position.sub(unit.GetNode().position).mag();
            if(dis - unit.CollisionSize <= this.DAMAGE_RADIUS) 
            {
                // 造成伤害
                Core.GameLogic.ServerRequestMgr.ReqUnitHPChange(unitID, -this.FIRE_DAMAGE);
            }
        });
    }

    Update(): void
    {
        this.m_iTickCnt++;
        this.m_iDmgTickCnt++;

        if(this.m_iDmgTickCnt >= this.RESULT_TICK_CNT) 
        {
            this.m_iDmgTickCnt = 0;
            this.ApplyDmg();
        }

        // 计算火焰动画
        if(this.m_bFireIsLoad) 
        {
            // 第一个火焰的角度
            let rot = this.m_iTickCnt * this.FIRE_ROTATE_TICK_SPEED % 360;
            for(let i = 0; i < this.m_arrFireNode.length; i++) 
            {
                let fireNode = this.m_arrFireNode[i];
                let nowRot = ((rot + i * (360 / this.FIRE_ANIMATION_CNT)) >> 0) % 360;
                let deltaVec = new cc.Vec2(Math.sin(nowRot / 180 * Math.PI), Math.cos(nowRot / 180 * Math.PI)).mul(this.DAMAGE_RADIUS);
                fireNode.position = this.m_stUnit.GetNode().position.add(deltaVec);
                fireNode.rotation = nowRot;
            }
        }
    }

    IsFinished(): boolean
    {
        return this.m_iTickCnt >= this.FIRE_TIME;
    }

    Clear(): void
    {
        for(let i = 0; i < this.m_arrFireNode.length; i++) 
        {
            let fireNode = this.m_arrFireNode[i];
            fireNode.destroy();
        }
        while(this.m_arrFireNode.length > 0) 
        {
            this.m_arrFireNode.pop();
        }
    }
}