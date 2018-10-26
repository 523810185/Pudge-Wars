import {HPBar} from "./HPBar";

export enum eUnitType 
{
    Hero = 0,
    Building = 1,
    Other = 2
}

export class Unit 
{
    constructor(node: cc.Node, eType: eUnitType, showHPBar: boolean = true)  
    {
        this.m_stNode = node;
        this.m_eType = eType;
        this.Init(10, 100);
        // 设置hpBar
        if(showHPBar) 
        {
            this.m_stHPBar = new HPBar(this);
        }
    }

    /**节点本身 */
    private m_stNode: cc.Node;
    /**节点类型 */
    private m_eType: eUnitType;
    /**移动速度 */
    private m_iSpeed: number;
    /**目前生命值 */
    private m_iNowHP: number;
    /**最大生命值 */
    private m_iMaxHP: number;
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

    /**得到单位节点 */
    public GetNode(): cc.Node 
    {
        return this.m_stNode;
    }

    /**
     * 初始化一些单位的属性值
     * @param speed 移动速度，默认为10
     * @param maxHP 最大生命值，默认为100
     * @param nowHP 当前生命值，默认为最大生命值
     */
    public Init(speed: number, maxHP: number, nowHP: number = maxHP): Unit 
    {
        this.m_iSpeed = speed;
        this.m_iMaxHP = maxHP;
        this.m_iNowHP = nowHP;
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