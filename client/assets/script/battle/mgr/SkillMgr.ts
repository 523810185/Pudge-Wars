import {SkillBtn} from "../skill/SkillBtn";
import Core from "../../core/Core";

export class SkillMgr 
{
    private m_arrSkillBtn: Array<SkillBtn>;

    constructor() 
    {
        this.Init();
    }

    private Init(): void
    {
        this.m_arrSkillBtn = new Array<SkillBtn>(1);
        let canvas = cc.find("Canvas");
        this.m_arrSkillBtn[0] = new SkillBtn(canvas.getChildByName('skill1'));
    }

    /**将技能的按钮显示出来 */
    public Awake(): void 
    {
        for(let item of this.m_arrSkillBtn) 
        {
            item.Show();
        }

        // 将cd计时器放入TickMgr中
        for(let item of this.m_arrSkillBtn) 
        {
            Core.TickMgr.AddTicker(item);
        }
    }

    /**
     * 返回第id个技能是否处于cd状态
     * @param btnID 技能按钮的序号
     */
    public IsInCD(btnID: number): boolean 
    {
        return this.m_arrSkillBtn[btnID - 1].InCD;
    }

    /**
     * 设置第id个技能的cd长短
     * @param btnID 技能按钮的序号
     * @param cdLength cd长度
     */
    public SetCDLength(btnID: number, cdLength: number): void 
    {
        this.m_arrSkillBtn[btnID - 1].CDLength = cdLength;
    }

    /**
     * 设置第id个技能进入cd
     * @param btnID 技能按钮的序号
     */
    public GoInCD(btnID: number): void 
    {
        this.m_arrSkillBtn[btnID - 1].GoInCD();
    }

    /**
     * 使第id个技能进入被选择状态
     * @param btnID 技能按钮的序号
     */
    public GoClickState(btnID: number): void 
    {
        this.m_arrSkillBtn[btnID - 1].GoInClickState();
    }

    /**
     * 使第id个技能进入正常状态
     * @param btnID 技能按钮的序号
     */
    public GoNormalState(btnID: number): void 
    {
        this.m_arrSkillBtn[btnID - 1].GoInNormalState();
    }
}