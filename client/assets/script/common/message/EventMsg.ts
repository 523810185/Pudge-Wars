import {EventMsg} from "../../core/EventMgr";

/**
 * 单位释放技能的消息
 */
export class UnitSkillMsg implements EventMsg 
{
    private m_iBtnID: number;
    private m_iUnitID: number;
    private m_iSkillID: number;
    private m_stPos: cc.Vec2;
    private m_iClickUnitID: number;
    constructor(btnID: number, unitID: number, skillID: number, pos: cc.Vec2, clickUnitID: number) 
    {
        this.m_iBtnID = btnID;
        this.m_iUnitID = unitID;
        this.m_iSkillID = skillID;
        this.m_stPos = pos;
        this.m_iClickUnitID = clickUnitID;
    }

    public get BtnID(): number {return this.m_iBtnID;}
    public get UnitID(): number {return this.m_iUnitID;}
    public get SkillID(): number {return this.m_iSkillID;}
    public get Pos(): cc.Vec2 {return this.m_stPos;}
    public get ClickUnitID(): number {return this.m_iClickUnitID;}
}

/**
 * 单位移动的消息
 */
export class UnitMoveMsg implements EventMsg 
{
    private m_iUnitID: number;
    private m_stPos: cc.Vec2;
    constructor(unitID: number, pos: cc.Vec2) 
    {
        this.m_iUnitID = unitID;
        this.m_stPos = pos;
    }

    public get UnitID(): number {return this.m_iUnitID;}
    public get Pos(): cc.Vec2 {return this.m_stPos;}
}

/**
 * 单位生命值发生变化的消息
 */
export class UnitHPChangeMsg implements EventMsg 
{
    private m_iUnitID: number;
    private m_iHpChange: number;
    constructor(unitID: number, hpChange: number) 
    {
        this.m_iUnitID = unitID;
        this.m_iHpChange = hpChange;
    }

    public get UnitID(): number {return this.m_iUnitID;}
    public get HPChange(): number {return this.m_iHpChange;}
}

/**
 * 地图上产生新物品的消息
 */
export class SpawnThingsMsg implements EventMsg 
{
    private m_iThingID: number;
    private m_iSkillID: number;
    private m_stPos: cc.Vec2;
    constructor(thingID: number, skillID: number, pos: cc.Vec2) 
    {
        this.m_iThingID = thingID;
        this.m_iSkillID = skillID;
        this.m_stPos = pos;
    }

    public get ThingID(): number {return this.m_iThingID;}
    public get SkillID(): number {return this.m_iSkillID;}
    public get Pos(): cc.Vec2 {return this.m_stPos;}
}

/**
 * 单位拾取物品的消息
 */
export class PickUpThingMsg implements EventMsg 
{
    private m_iUnitID: number;
    private m_iThingID: number;
    constructor(unitID: number, thingID: number) 
    {
        this.m_iUnitID = unitID;
        this.m_iThingID = thingID;
    }

    public get UnitID(): number {return this.m_iUnitID;}
    public get ThingID(): number {return this.m_iThingID;}
}