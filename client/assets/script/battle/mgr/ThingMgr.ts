import Core from "../../core/Core";
import {SkillThing} from "../skill/SkillThing";
import {CoreConfig} from "../../core/CoreConfig";
import {eMessageHead} from "../../core/NetMgr";

export class ThingMgr 
{
    /**舞台 */
    private m_stCanvas: cc.Node;
    /**管理物品的map */
    private m_mapThingMgr: Map<number, SkillThing>;

    constructor() 
    {
        this.Init();
    }

    private Init(): void
    {
        this.m_stCanvas = cc.find("Canvas");
        this.m_mapThingMgr = new Map<number, SkillThing>();
    }

    /**
     * 创建一个技能物品
     * @param thingID 物品的id
     * @param skillID 携带技能的id
     * @param pos 物品的位置
     */
    public CreateSkillThing(thingID: number, skillID: number, pos: cc.Vec2): void 
    {
        let thingNode = Core.PoolMgr.GetPoolByName("things").CheckOut();
        this.m_stCanvas.addChild(thingNode);
        thingNode.position = pos;

        let ticker: SkillThing = new SkillThing(thingID, skillID, pos, thingNode);
        Core.TickMgr.AddTicker(ticker);
        this.m_mapThingMgr.set(thingID, ticker);
    }

    /**
     * 销毁指定id的物品，如果有指定的拾取者，则做对应的处理
     * @param thingID 物品id
     * @param unitID 拾取者id，可选参数
     */
    public DestroyThingByID(thingID: number, unitID?: number) 
    {
        let skillThing: SkillThing = this.m_mapThingMgr.get(thingID);
        this.m_mapThingMgr.delete(thingID);
        Core.PoolMgr.GetPoolByName("things").CheckIn(skillThing.GetNode());

        if(unitID != undefined) 
        {
            if(unitID == CoreConfig.MY_HERO_ID) 
            {
                Core.GameLogic.SkillMgr.GainNewSkill(skillThing.GetSkillID());
                // 向服务器发送归还技能消息
                // TODO ... 待封装
                let content = {
                    unitID: CoreConfig.MY_HERO_ID,
                    thingID: thingID,
                    skillID: skillThing.GetSkillID()
                };
                Core.NetMgr.EmitMsgToServer(eMessageHead.RETURN_SKILL_THING, JSON.stringify(content));
            }
        }
    }

    /**游戏结束后的清空 */
    public ClearGame(): void 
    {
        this.m_mapThingMgr.forEach((skillThing: SkillThing, thingID: number) =>
        {
            this.DestroyThingByID(thingID);
        });
        this.m_mapThingMgr.clear();
    }
}