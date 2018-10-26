import {BaseTicker} from "../../common/BaseTicker";
import Core from "../../core/Core";
import {Unit, eUnitType} from "../common/Unit";
import {CoreConfig} from "../../core/CoreConfig";
import {eMessageHead, eTickMessageType} from "../../core/NetMgr";

export class SkillThing implements BaseTicker
{
    /**是否被拾取 */
    private m_bIsPicked: boolean = false;
    /**物品的id */
    private m_iThingID: number;
    /**携带的技能id */
    private m_iSkillID: number;
    /**node本身 */
    private m_stNode: cc.Node;
    /**物品位置 */
    private m_stPos: cc.Vec2;
    /**拾取半径 */
    private m_iPickRadius: number = 50;

    constructor(thingID: number, skillID: number, pos: cc.Vec2, node: cc.Node) 
    {
        this.m_iThingID = thingID;
        this.m_iSkillID = skillID;
        this.m_stPos = pos;
        this.m_stNode = node;
    }

    /**获得节点 */
    public GetNode(): cc.Node 
    {
        return this.m_stNode;
    }

    /**获得携带的技能id */
    public GetSkillID(): number 
    {
        return this.m_iSkillID;
    }

    Update(): void 
    {
        Core.GameLogic.UnitMgr.VisitUnit((unit: Unit, unitID: number) =>
        {
            if(unit.Type != eUnitType.Hero) 
            {
                return;
            }

            let dis = unit.GetNode().position.sub(this.m_stPos).mag();
            if(dis <= this.m_iPickRadius && unitID == CoreConfig.MY_HERO_ID && !Core.GameLogic.SkillMgr.IsFullSkill()) 
            {
                this.m_bIsPicked = true;
                // 发送消息给服务器
                let content = {
                    unitID: CoreConfig.MY_HERO_ID,
                    thingID: this.m_iThingID
                };
                Core.NetMgr.SendTickMessage(eTickMessageType.PICK_UP, content);
            }
        });
    }

    IsFinished(): boolean 
    {
        return this.m_bIsPicked;
    }

    Clear(): void 
    {

    }
}