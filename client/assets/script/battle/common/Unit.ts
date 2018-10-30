import {HPBar} from "./HPBar";

/**单位类型 */
export enum eUnitType 
{
    Hero = 0,
    Building = 1,
    Other = 2
}

/**单位阵营 */
export enum eUnitTeam
{
    Red = 0,
    Blue = 1,
    Other = 2
}

export class Unit 
{
    constructor(node: cc.Node, eType: eUnitType, eTeam: eUnitTeam, showHPBar: boolean = true)  
    {
        this.m_stNode = node;
        this.m_eType = eType;
        this.m_eTeam = eTeam;
        this.Init(5, 30, 100);
        // 设置hpBar
        if(showHPBar) 
        {
            this.m_stHPBar = new HPBar(this);
        }
    }

    /**节点本身 */
    private m_stNode: cc.Node;
    /**单位类型 */
    private m_eType: eUnitType;
    /**单位阵营 */
    private m_eTeam: eUnitTeam;
    /**移动速度 */
    private m_iSpeed: number;
    /**目前生命值 */
    private m_iNowHP: number;
    /**最大生命值 */
    private m_iMaxHP: number;
    /**碰撞体积 */
    private m_iCollisionSize: number;
    /**是否魔免 */
    private m_bIsMagicImmunity: boolean;
    /**HPBar */
    private m_stHPBar: HPBar;

    public get Type(): eUnitType 
    {
        return this.m_eType;
    }

    public set Type(eType: eUnitType) 
    {
        this.m_eType = eType;
    }

    public get Team(): eUnitTeam
    {
        return this.m_eTeam;
    }

    public set Team(eTeam: eUnitTeam) 
    {
        this.m_eTeam = eTeam;
    }

    public get Speed(): number 
    {
        return this.m_iSpeed;
    }

    public set Speed(speed: number) 
    {
        this.m_iSpeed = speed;
    }

    public get NowHP(): number 
    {
        return this.m_iNowHP;
    }

    public set NowHP(hp: number) 
    {
        this.m_iNowHP = hp;
        if(this.m_iNowHP > this.m_iMaxHP)
        {
            this.m_iNowHP = this.m_iMaxHP;
        }
        else if(this.m_iNowHP <= 0) 
        {
            this.Die();
        }
    }

    public get MaxHP(): number 
    {
        return this.m_iMaxHP;
    }

    public set MaxHP(hp: number) 
    {
        this.m_iMaxHP = hp;
    }

    public get CollisionSize(): number 
    {
        return this.m_iCollisionSize;
    }

    public set CollisionSize(collisionSize: number) 
    {
        this.m_iCollisionSize = collisionSize;
    }

    public get IsMagicImmunity(): boolean 
    {
        return this.m_bIsMagicImmunity;
    }

    public set IsMagicImmunity(isMagicImmunity: boolean) 
    {
        this.m_bIsMagicImmunity = isMagicImmunity;
    }

    /**得到单位节点 */
    public GetNode(): cc.Node 
    {
        return this.m_stNode;
    }

    /**
     * 初始化一些单位的属性值
     * @param speed 移动速度，默认为5
     * @param collisionSize 碰撞体积，默认为30
     * @param maxHP 最大生命值，默认为100
     * @param nowHP 当前生命值，默认为最大生命值
     * @param isMagicImmunity 是否魔免，默认不是魔免
     */
    public Init(speed: number, collisionSize: number, maxHP: number, nowHP: number = maxHP, isMagicImmunity: boolean = false): Unit 
    {
        this.m_iSpeed = speed;
        this.m_iCollisionSize = collisionSize;
        this.m_iMaxHP = maxHP;
        this.m_iNowHP = nowHP;
        this.m_bIsMagicImmunity = isMagicImmunity;
        return this;
    }

    /**单位死亡 */
    public Die(): void 
    {
        // TODO: 单位死亡单位如何处理的逻辑以后要修改
        this.m_stNode.destroy();
        // 销毁hpBar
        this.m_stHPBar.Destroy();
    }
}