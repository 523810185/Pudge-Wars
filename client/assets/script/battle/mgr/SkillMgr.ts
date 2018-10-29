import {SkillBtn} from "../skill/SkillBtn";
import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";

/**返回该技能下一步需要做什么 */
export enum eSkillStateNext
{
    TO_CHOOSE_STATE = 0, // 进入选择状态
    TO_GO = 1,      // 直接释放
    IN_CD = 2,      // 处于cd状态
    NULL = 3        // 没有该技能 
}

export class SkillMgr 
{
    /**舞台 */
    private m_stCanvas: cc.Node;
    /**技能们的数据结构 */
    private m_arrSkillBtn: Array<SkillBtn>;
    /**各个技能对应的技能id是多少 */
    private m_arrSkillID: Array<number>;
    /**记录各技能id的技能是否是指向型技能 */
    private m_mapIsClickToSkill: Map<number, boolean>;
    /**记录各技能id的图片资源url */
    private m_mapSkillUrl: Map<number, string>;
    /**技能上限个数 */
    private MAX_SKILL_CNT: number = 3;

    constructor() 
    {
        this.Init();
    }

    private Init(): void
    {
        this.m_stCanvas = cc.find("Canvas");

        this.m_arrSkillBtn = new Array<SkillBtn>(3);
        this.m_arrSkillID = new Array<number>(3);
        this.m_mapIsClickToSkill = new Map<number, boolean>();
        this.m_mapSkillUrl = new Map<number, string>();
        this.InitIsClickToMap();
        this.InitSkillUrlMap();

        this.m_arrSkillID[0] = CoreConfig.SKILL_HOOK;
        this.m_arrSkillID[1] = CoreConfig.SKILL_FIRE_AROUND;
        this.m_arrSkillID[2] = CoreConfig.SKILL_SPEED_UP;

        this.m_arrSkillBtn[0] = new SkillBtn(this.m_stCanvas.getChildByName('skill1'));
        this.m_arrSkillBtn[1] = new SkillBtn(this.m_stCanvas.getChildByName('skill2'));
        this.m_arrSkillBtn[2] = new SkillBtn(this.m_stCanvas.getChildByName('skill3'));
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

    /**
     * 根据按键id得到技能id
     * @param btnID 按键id
     */
    public GetSkillIDByBtnID(btnID: number): number 
    {
        return this.m_arrSkillID[btnID - 1];
    }

    /**
     * 返回某个技能被按键响应以后的状态
     * @param btnID 第id个技能
     */
    public GetSkillStateNext(btnID: number): eSkillStateNext 
    {
        let realID = btnID - 1;
        // 判断是否有该技能
        if(this.m_arrSkillID[realID] == CoreConfig.SKILL_NULL)
        {
            return eSkillStateNext.NULL;
        }
        // 有技能的情况下，判断是否处于cd
        else if(this.m_arrSkillBtn[realID].InCD) 
        {
            return eSkillStateNext.IN_CD;
        }
        // 拥有技能并且没有处于cd，则返回该技能的指向型情报
        else 
        {
            return this.IsClickToSkill(this.m_arrSkillID[realID]) ? eSkillStateNext.TO_CHOOSE_STATE : eSkillStateNext.TO_GO;
        }
    }

    /**返回是否已经拥有技能已达上限 */
    public IsFullSkill(): boolean 
    {
        for(let i = 0; i < this.MAX_SKILL_CNT; i++) 
        {
            if(this.m_arrSkillID[i] == CoreConfig.SKILL_NULL) 
            {
                return false;
            }
        }
        return true;
    }

    /**
     * 获取新技能
     * @param skillID 技能id
     */
    public GainNewSkill(skillID: number): void 
    {
        if(this.IsFullSkill()) 
        {
            return;
        }

        // 如果技能没有满，则添加技能
        for(let i = 0; i < this.MAX_SKILL_CNT; i++)
        {
            if(this.m_arrSkillID[i] == CoreConfig.SKILL_NULL) 
            {
                console.log("你的", i + 1, "号位置获得了", skillID);
                this.m_arrSkillID[i] = skillID;
                this.m_arrSkillBtn[i].SetSkillAvatar(this.m_mapSkillUrl[skillID]);
                break;
            }
        }
    }

    /**初始化技能是否是指向技能的表 */
    private InitIsClickToMap(): void 
    {
        // TODO ... 重构，从外部读表
        this.m_mapIsClickToSkill[CoreConfig.SKILL_HOOK] = true;
        this.m_mapIsClickToSkill[CoreConfig.SKILL_SPEED_UP] = false;
        this.m_mapIsClickToSkill[CoreConfig.SKILL_FIRE_AROUND] = false
    }

    /**初始化技能的url集合 */
    private InitSkillUrlMap(): void 
    {
        // TODO ... 重构，从外部读表
        this.m_mapSkillUrl[CoreConfig.SKILL_HOOK] = "skill_hook";
        this.m_mapSkillUrl[CoreConfig.SKILL_SPEED_UP] = "skill_speedUp";
        this.m_mapSkillUrl[CoreConfig.SKILL_FIRE_AROUND] = "skill_fireAround";
    }

    /**
     * 根据技能id返回是否是指向型技能
     * @param skillID 技能id
     */
    private IsClickToSkill(skillID: number): boolean 
    {
        return this.m_mapIsClickToSkill.has(skillID) ? false : this.m_mapIsClickToSkill[skillID];
    }
}