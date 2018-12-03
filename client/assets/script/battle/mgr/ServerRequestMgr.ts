import Core from "../../core/Core";
import {eTickMessageType, eMessageHead, NetMgr} from "../../core/NetMgr";

/**
 * 这是一个封装了一些与服务器通讯请求的一个类，避免业务层直接调用到底层的代码
 * 如果有新的通讯逻辑业务，加到这里统一管理即可
 */
export class ServerRequestMgr 
{
    private m_pNetMgr: NetMgr;
    constructor() 
    {
        this.Init();
    }

    private Init(): void 
    {
        this.m_pNetMgr = Core.NetMgr;
    }

    /**
     * 告知服务器单位生命值变化
     * @param unitID 单位的id
     * @param hpChange 生命值变化量
     */
    public ReqUnitHPChange(unitID: number, hpChange: number): void 
    {
        let content = {
            unitID: unitID,
            hpChange: hpChange
        };
        this.m_pNetMgr.SendTickMessage(eTickMessageType.HP_CHANGE, content);
    }

    /**
     * 向服务器请求归还物品
     * @param unitID 拾取单位的id
     * @param thingID 物品的id
     * @param skillID 包含技能的id
     */
    public ReqReturnSkillThing(unitID: number, thingID: number, skillID: number) 
    {
        let content = {
            unitID: unitID,
            thingID: thingID,
            skillID: skillID
        };
        this.m_pNetMgr.EmitMsgToServer(eMessageHead.RETURN_SKILL_THING, JSON.stringify(content));
    }

    /**
     * 向服务器发送游戏结束的请求
     * @param winnerTeamMask 胜利者队伍的掩码
     */
    public ReqGameOver(winnerTeamMask: number): void
    {
        let content = {
            result: "win",
            teamMask: winnerTeamMask
        };
        this.m_pNetMgr.EmitMsgToServer(eMessageHead.GAME_END, JSON.stringify(content));
    }
}