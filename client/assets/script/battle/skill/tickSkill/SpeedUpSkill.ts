import {BaseTicker} from "../../../common/BaseTicker";
import {Unit} from "../../common/Unit";
import {FloatNumHandler} from "../../../common/FloatNumHandler";
import Core from "../../../core/Core";

export class SpeedUpSkill implements BaseTicker
{
    /**完结帧号 */
    private readonly END_CNT: number = 60 * 5;
    /**附加的移动速度 */
    private readonly ADD_SPEED: number = 10;
    /**残影的数目 */
    private readonly SHADOW_CNT: number = 10;
    /**每隔多少帧放置一个阴影 */
    private readonly DELTA_TICK_NUMBER: number = 3;
    /**保存过去位置的帧数 */
    private readonly POS_BEFORE_CNT: number = this.SHADOW_CNT * this.DELTA_TICK_NUMBER;

    /**计数器 */
    private m_iNowCnt: number = 0;
    /**被加速的单位 */
    private m_stUnit: Unit;
    /**过去若干帧每帧的位置记录 */
    private m_arrPosBefore: Array<cc.Vec2>;
    /**过去若干帧每帧的朝向记录 */
    private m_arrRotBefore: Array<number>;
    /**阴影的预置体集合 */
    private m_arrShadow: Array<cc.Node>;

    constructor(unit: Unit) 
    {
        this.m_stUnit = unit;
        this.Init();
    }

    private Init(): void 
    {
        // 加速
        this.m_stUnit.Speed += this.ADD_SPEED;
        // 初始化过去帧数的位置和朝向
        this.m_arrPosBefore = new Array<cc.Vec2>();
        this.m_arrRotBefore = new Array<number>();
        let nowPos: cc.Vec2 = this.m_stUnit.GetNode().position;
        nowPos.x = FloatNumHandler.PreservedTo(nowPos.x);
        nowPos.y = FloatNumHandler.PreservedTo(nowPos.y);
        for(let i = 0; i < this.POS_BEFORE_CNT; i++) 
        {
            this.m_arrPosBefore.push(nowPos);
            this.m_arrRotBefore.push(this.m_stUnit.GetNode().rotation);
        }
        // 初始化阴影的集合
        let canvas = cc.find("Canvas");
        this.m_arrShadow = new Array<cc.Node>();
        for(let i = 0; i < this.SHADOW_CNT; i++) 
        {
            let node: cc.Node = Core.PoolMgr.GetPoolByName("pudge").CheckOut();
            canvas.addChild(node);
            node.opacity = 255 * (1 - (i + 1) / this.SHADOW_CNT);
            node.zIndex = this.m_stUnit.GetNode().zIndex - 10; // 保证不覆盖技能释放者
            node.position = nowPos;
            this.m_arrShadow.push(node);
        }
    }

    public Update(): void 
    {
        this.m_iNowCnt++;
        if(this.IsFinished()) 
        {
            this.m_stUnit.Speed -= this.ADD_SPEED;
        }
        else 
        {
            // 调整之前记录的位置和朝向
            let nowPos: cc.Vec2 = this.m_stUnit.GetNode().position;
            nowPos.x = FloatNumHandler.PreservedTo(nowPos.x);
            nowPos.y = FloatNumHandler.PreservedTo(nowPos.y);
            for(let i = this.POS_BEFORE_CNT - 1; i > 0; i--)
            {
                this.m_arrPosBefore[i] = this.m_arrPosBefore[i - 1];
                this.m_arrRotBefore[i] = this.m_arrRotBefore[i - 1];
            }
            this.m_arrPosBefore[0] = nowPos;
            this.m_arrRotBefore[0] = this.m_stUnit.GetNode().rotation;
            // 调整阴影的位置
            for(let i = 0; i < this.SHADOW_CNT; i++)
            {
                let tick_num = (i + 1) * this.DELTA_TICK_NUMBER - 1;
                this.m_arrShadow[i].position = this.m_arrPosBefore[tick_num];
                this.m_arrShadow[i].rotation = this.m_arrRotBefore[tick_num];
            }
        }
    }

    public IsFinished(): boolean 
    {
        return this.m_iNowCnt >= this.END_CNT;
    }

    public Clear(): void 
    {
        for(let i = 0; i < this.SHADOW_CNT; i++) 
        {
            Core.PoolMgr.GetPoolByName("pudge").CheckIn(this.m_arrShadow[i]);
        }
        while(this.m_arrPosBefore.length > 0) 
        {
            this.m_arrPosBefore.pop();
        }
        while(this.m_arrShadow.length > 0) 
        {
            this.m_arrShadow.pop();
        }
    }
}