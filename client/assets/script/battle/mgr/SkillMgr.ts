import {SkillBtn} from "../skill/SkillBtn";
import Core from "../../core/Core";
import {CoreConfig} from "../../core/CoreConfig";
import {Unit, eUnitType} from "../common/Unit";
import {FloatNumHandler} from "../../common/FloatNumHandler";

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
    /**记录各技能id的技能的指向型信息，0为非点击型技能，1为非指向型技能，2为指向型技能 */
    private m_mapSkillClickInfo: Map<number, number>;
    /**记录各技能id的技能“要求的单位的状态掩码”，如果是-1表示是非指向型技能 */
    private m_mapSkillStateMask: Map<number, number>;
    /**记录各技能id的图片资源url */
    private m_mapSkillUrl: Map<number, string>;
    /**记录各技能使用次数 */
    private m_mapSkillUseCnt: Map<number, number>;
    /**记录各技能cd长短 */
    private m_mapSkillCDLength: Map<number, number>;
    /**ClickMgr */
    private m_stClickMgr: ClickMgr;
    /**技能上限个数 */
    private MAX_SKILL_CNT: number = 3;

    constructor() 
    {
        this.Init();
    }

    private Init(): void
    {
        this.m_stCanvas = cc.find("Canvas");

        this.m_arrSkillBtn = new Array<SkillBtn>(this.MAX_SKILL_CNT);
        this.m_arrSkillID = new Array<number>(this.MAX_SKILL_CNT);
        this.m_mapSkillClickInfo = new Map<number, number>();
        this.m_mapSkillStateMask = new Map<number, number>();
        this.m_mapSkillUrl = new Map<number, string>();
        this.m_mapSkillUseCnt = new Map<number, number>();
        this.m_mapSkillCDLength = new Map<number, number>();
        this.m_stClickMgr = new ClickMgr();
        this.InitSkillClickInfo();
        this.InitSkillStateMask();
        this.InitSkillUrlMap();
        this.InitSkillUseCntMap();
        this.InitSkillCDLengthMap();

        this.m_arrSkillID[0] = CoreConfig.SKILL_HOOK;
        this.m_arrSkillID[1] = CoreConfig.SKILL_THUNDER_STRIKE;
        this.m_arrSkillID[2] = CoreConfig.SKILL_AVATAR;

        this.m_arrSkillBtn[0] = new SkillBtn(this.m_stCanvas.getChildByName('skill1'));
        this.m_arrSkillBtn[1] = new SkillBtn(this.m_stCanvas.getChildByName('skill2'));
        this.m_arrSkillBtn[2] = new SkillBtn(this.m_stCanvas.getChildByName('skill3'));
    }

    /**将技能的按钮显示出来 */
    public Awake(): void 
    {
        for(let i = 0; i < this.MAX_SKILL_CNT; i++) 
        {
            let item = this.m_arrSkillBtn[i];
            let skillID = this.m_arrSkillID[i];
            item.SetSkillAvatar(this.m_mapSkillUrl[skillID]);
            item.Show();
            item.SetUseCnt(this.m_mapSkillUseCnt[skillID], this.m_mapSkillCDLength[skillID]);
        }

        // 将cd计时器放入TickMgr中
        for(let item of this.m_arrSkillBtn) 
        {
            Core.TickMgr.AddTicker(item);
        }
    }

    // /**
    //  * 设置第id个技能的cd长短
    //  * @param btnID 技能按钮的序号
    //  * @param cdLength cd长度
    //  */
    // public SetCDLength(btnID: number, cdLength: number): void 
    // {
    //     this.m_arrSkillBtn[btnID - 1].CDLength = cdLength;
    // }

    /**
     * 设置第id个技能进入cd
     * @param btnID 技能按钮的序号
     */
    public GoInCD(btnID: number): void 
    {
        let realBtnID: number = btnID - 1;
        let useUp = this.m_arrSkillBtn[realBtnID].GoInCD();
        if(useUp == true) // 次数用尽的逻辑
        {
            // 图标设置为默认图标
            this.m_arrSkillBtn[realBtnID].SetSkillAvatar(this.m_mapSkillUrl[CoreConfig.SKILL_NULL]);
            this.m_arrSkillID[realBtnID] = CoreConfig.SKILL_NULL;
        }
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
     * 返回某个点击型技能点击以后的结果。
     * 返回的结果若为ACCEPT_CLICK_OPERATION，如果指向的单位ID为-1，表示为非指向型技能
     * @param btnID 第id个技能
     * @param clickTo 点击的位置
     */
    public GetSkillClickResult(btnID: number, clickTo: cc.Vec2): ClickResultStruct
    {
        let realBtnID = btnID - 1;
        let skillID = this.m_arrSkillID[realBtnID];
        if(this.m_mapSkillClickInfo[skillID] == 1) 
        {
            return new ClickResultStruct(eClickResult.ACCEPT_CLICK_OPERATION, -1);
        }
        else 
        {
            return this.m_stClickMgr.SkillClickTo(this.m_mapSkillStateMask[skillID], clickTo);
        }
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
                this.m_arrSkillBtn[i].SetUseCnt(this.m_mapSkillUseCnt[skillID], this.m_mapSkillCDLength[skillID]);
                break;
            }
        }
    }

    /**初始化技能是否是指向技能的表 */
    private InitSkillClickInfo(): void 
    {
        // TODO ... 重构，从外部读表
        this.m_mapSkillClickInfo[CoreConfig.SKILL_HOOK] = 1;
        this.m_mapSkillClickInfo[CoreConfig.SKILL_SPEED_UP] = 0;
        this.m_mapSkillClickInfo[CoreConfig.SKILL_FIRE_AROUND] = 0;
        this.m_mapSkillClickInfo[CoreConfig.SKILL_ICE_DART_SCATTER] = 1;
        this.m_mapSkillClickInfo[CoreConfig.SKILL_ICE_WIND] = 0;
        this.m_mapSkillClickInfo[CoreConfig.SKILL_FLASH_AWAY] = 1;
        this.m_mapSkillClickInfo[CoreConfig.SKILL_THUNDER_STRIKE] = 1;
        this.m_mapSkillClickInfo[CoreConfig.SKILL_AVATAR] = 0;
    }

    /**初始化各技能id的技能“要求的单位的状态掩码”---指向型技能专用 */
    private InitSkillStateMask(): void 
    {
        // TODO ... 重构，从外部读表
        this.m_mapSkillStateMask[CoreConfig.SKILL_HOOK] = -1;
        this.m_mapSkillStateMask[CoreConfig.SKILL_SPEED_UP] = -1;
        this.m_mapSkillStateMask[CoreConfig.SKILL_FIRE_AROUND] = -1;
        this.m_mapSkillStateMask[CoreConfig.SKILL_ICE_DART_SCATTER] = -1;
        this.m_mapSkillStateMask[CoreConfig.SKILL_ICE_WIND] = -1;
        this.m_mapSkillStateMask[CoreConfig.SKILL_FLASH_AWAY] = -1;
        this.m_mapSkillStateMask[CoreConfig.SKILL_THUNDER_STRIKE] = -1;
        this.m_mapSkillStateMask[CoreConfig.SKILL_AVATAR] = -1;
    }

    /**初始化技能的url集合 */
    private InitSkillUrlMap(): void 
    {
        // TODO ... 重构，从外部读表
        this.m_mapSkillUrl[CoreConfig.SKILL_NULL] = "skill_null";
        this.m_mapSkillUrl[CoreConfig.SKILL_HOOK] = "skill_hook";
        this.m_mapSkillUrl[CoreConfig.SKILL_SPEED_UP] = "skill_speedUp";
        this.m_mapSkillUrl[CoreConfig.SKILL_FIRE_AROUND] = "skill_fireAround";
        this.m_mapSkillUrl[CoreConfig.SKILL_ICE_DART_SCATTER] = "skill_iceDartScatter";
        this.m_mapSkillUrl[CoreConfig.SKILL_ICE_WIND] = "skill_iceWind";
        this.m_mapSkillUrl[CoreConfig.SKILL_FLASH_AWAY] = "skill_flashAway";
        this.m_mapSkillUrl[CoreConfig.SKILL_THUNDER_STRIKE] = "skill_thunderStrike";
        this.m_mapSkillUrl[CoreConfig.SKILL_AVATAR] = "skill_avatar";
    }

    /**初始化技能的使用次数集合 */
    private InitSkillUseCntMap(): void 
    {
        // TODO ... 重构，从外部读表
        this.m_mapSkillUseCnt[CoreConfig.SKILL_NULL] = -1;
        this.m_mapSkillUseCnt[CoreConfig.SKILL_HOOK] = -1;
        this.m_mapSkillUseCnt[CoreConfig.SKILL_SPEED_UP] = 1;
        this.m_mapSkillUseCnt[CoreConfig.SKILL_FIRE_AROUND] = 1;
        this.m_mapSkillUseCnt[CoreConfig.SKILL_ICE_DART_SCATTER] = 2;
        this.m_mapSkillUseCnt[CoreConfig.SKILL_ICE_WIND] = 2;
        this.m_mapSkillUseCnt[CoreConfig.SKILL_FLASH_AWAY] = 1;
        this.m_mapSkillUseCnt[CoreConfig.SKILL_THUNDER_STRIKE] = 2;
        this.m_mapSkillUseCnt[CoreConfig.SKILL_AVATAR] = 1;
    }

    /**初始化技能的cd集合 */
    private InitSkillCDLengthMap(): void 
    {
        // TODO ... 重构，从外部读表
        this.m_mapSkillCDLength[CoreConfig.SKILL_NULL] = 0;
        this.m_mapSkillCDLength[CoreConfig.SKILL_HOOK] = 3;
        this.m_mapSkillCDLength[CoreConfig.SKILL_SPEED_UP] = 0;
        this.m_mapSkillCDLength[CoreConfig.SKILL_FIRE_AROUND] = 0;
        this.m_mapSkillCDLength[CoreConfig.SKILL_ICE_DART_SCATTER] = 12;
        this.m_mapSkillCDLength[CoreConfig.SKILL_ICE_WIND] = 20;
        this.m_mapSkillCDLength[CoreConfig.SKILL_FLASH_AWAY] = 0;
        this.m_mapSkillCDLength[CoreConfig.SKILL_THUNDER_STRIKE] = 10;
        this.m_mapSkillCDLength[CoreConfig.SKILL_AVATAR] = 0;
    }

    /**
     * 根据技能id返回是否是指向型技能
     * @param skillID 技能id
     */
    private IsClickToSkill(skillID: number): boolean 
    {
        return this.m_mapSkillClickInfo.has(skillID) ? false : this.m_mapSkillClickInfo[skillID];
    }
}

export enum eClickResult 
{
    ACCEPT_CLICK_OPERATION = 0, // 可以被执行的点击操作
    NEED_CHOOSE_UNIT = 1, // 请选择单位
    CLICK_MAGIC_IMMUNITY_UNIT = 2, // 选择了魔免单位
    CLICK_MYSELF = 3,             // 不能点击自己而选择了自己
    CLICK_FRIENDLY_FORCE = 4,     // 点击了友军
    CLICK_ENEMY = 5,              // 点击了敌军
    CLICK_BUILDING = 6,           // 点击了建筑
}

export class ClickResultStruct 
{
    public m_eClickResult: eClickResult;
    public m_stClickUnitID: number;
    constructor(clickResult: eClickResult = eClickResult.ACCEPT_CLICK_OPERATION, clickUnitID: number = -1) 
    {
        this.m_eClickResult = clickResult;
        this.m_stClickUnitID = clickUnitID;
    }
}

// 隶属于SkillMgr的管理者
class ClickMgr
{
    constructor()
    {
        this.Init();
    }

    private Init(): void 
    {

    }

    /**
     * 技能指向了某个位置，寻找指定要求的单位，返回点击的结果
     * @param unitStateMask 寻找要求的单位的状态掩码，从左到右的二进制含义分别表示：
     *         是否可以选择魔免单位，是否可以选择建筑单位，是否可以选择敌军单位，是否可以选择友军单位，
     *         是否可以选择自己 
     * @param clickPos 点击的位置
     */
    public SkillClickTo(unitStateMask: number, clickPos: cc.Vec2): ClickResultStruct 
    {
        let result: ClickResultStruct = new ClickResultStruct();
        let unitArray: Array<number> = new Array<number>();
        Core.GameLogic.UnitMgr.VisitUnit((unit: Unit, unitID: number) =>
        {
            let dis = unit.GetNode().position.sub(clickPos).mag();
            if(dis <= unit.CollisionSize) 
            {
                unitArray.push(unitID);
            }
        });
        if(unitArray.length == 0) 
        {
            result.m_eClickResult = eClickResult.NEED_CHOOSE_UNIT;
        }
        else if(unitArray.length == 1) 
        {
            result.m_eClickResult = this.GetClickResult(unitStateMask, this.GetUnitByID(unitArray[0]));
            if(result.m_eClickResult == eClickResult.ACCEPT_CLICK_OPERATION) 
            {
                result.m_stClickUnitID = unitArray[0];
            }
        }
        else 
        {
            // 按照距离从大到小排序
            unitArray.sort((A: number, B: number) =>
            {
                let disA = this.GetUnitByID(A).GetNode().position.sub(clickPos).mag();
                let disB = this.GetUnitByID(B).GetNode().position.sub(clickPos).mag();
                disA = FloatNumHandler.PreservedTo(disA);
                disB = FloatNumHandler.PreservedTo(disB);
                if(disA == disB) return 0;
                if(disA < disB) return 1;
                return -1;
                // TODO ... 待测试
            });

            // 寻找最近的一个符合的单位
            let ansUnitID = -1;
            for(let unitID of unitArray) 
            {
                let res = this.GetClickResult(unitStateMask, this.GetUnitByID(unitID));
                if(res == eClickResult.ACCEPT_CLICK_OPERATION) 
                {
                    ansUnitID = unitID;
                }
                else if(ansUnitID == -1) // 没有符合的单位，以最近的一个单位的错误返回
                {
                    result.m_eClickResult = res;
                }
            }
            if(ansUnitID != -1) 
            {
                result.m_eClickResult = eClickResult.ACCEPT_CLICK_OPERATION;
            }
        }
        return result;
    }

    /**
     * 返回点击结果
     * @param unitStateMask 要求的掩码
     * @param unit 判定单位
     */
    private GetClickResult(unitStateMask: number, unit: Unit): eClickResult
    {
        let result: eClickResult = eClickResult.ACCEPT_CLICK_OPERATION;
        let Myself = Core.GameLogic.UnitMgr.GetUnitByID(CoreConfig.MY_HERO_ID);
        if(((unitStateMask >> 0) & 1) == 0 && unit == Myself) 
        {
            result = eClickResult.CLICK_MYSELF;
        }
        else if(((unitStateMask >> 1) & 1) == 0 && unit.Team == Myself.Team) 
        {
            result = eClickResult.CLICK_FRIENDLY_FORCE;
        }
        else if(((unitStateMask >> 2) & 1) == 0 && unit.Team != Myself.Team) 
        {
            result = eClickResult.CLICK_ENEMY;
        }
        else if(((unitStateMask >> 3) & 1) == 0 && unit.Type == eUnitType.Building) 
        {
            result = eClickResult.CLICK_FRIENDLY_FORCE;
        }
        else if(((unitStateMask >> 4) & 1) == 0 && unit.IsMagicImmunity) 
        {
            result = eClickResult.CLICK_MAGIC_IMMUNITY_UNIT;
        }
        return result;
    }

    private GetUnitByID(unitID: number): Unit 
    {
        return Core.GameLogic.UnitMgr.GetUnitByID(unitID);
    }
}