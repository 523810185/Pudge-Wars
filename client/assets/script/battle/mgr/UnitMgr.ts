export enum eType 
{
    Hero = 0,
    Building = 1,
    Other = 2
}

export class Unit 
{
    constructor(node: cc.Node, eType: eType)  
    {
        this.m_stNode = node;
        this.m_eType = eType;
        this.Init(10, 100);
    }

    /**节点本身 */
    private m_stNode: cc.Node;
    /**节点类型 */
    private m_eType: eType;
    /**移动速度 */
    private m_iSpeed: number;
    /**生命值 */
    private m_iHP: number;

    public get Type(): eType 
    {
        return this.m_eType;
    }

    public set Type(eType: eType) 
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

    public get HP(): number 
    {
        return this.m_iHP;
    }

    public set HP(hp: number) 
    {
        this.m_iHP = hp;
    }

    /**得到单位节点 */
    public GetNode(): cc.Node 
    {
        return this.m_stNode;
    }

    /**
     * 初始化一些单位的属性值
     * @param speed 移动速度，默认为10
     * @param hp 生命值，默认为100
     */
    public Init(speed: number, hp: number): Unit 
    {
        this.m_iSpeed = speed;
        this.m_iHP = hp;
        return this;
    }
}

export class UnitMgr 
{
    private m_stUnitMap: Map<number, Unit>;
    private m_stUnitArray: Array<Unit>;

    constructor() 
    {
        this.m_stUnitMap = new Map<number, Unit>();
        this.m_stUnitArray = new Array<Unit>();
    }

    public get UnitArray(): Array<Unit> 
    {
        return this.m_stUnitArray;
    }

    /**
     * 将一个物体插入
     * @param nodeID 物体的id
     * @param unit 物体本身
     */
    public InsertNode(nodeID: number, unit: Unit): void 
    {
        if(this.m_stUnitMap.get(nodeID)) 
        {
            cc.error("UnitMgr填入了一个已经存在的id，请检查逻辑。id为", nodeID);
        }
        else 
        {
            this.m_stUnitMap.set(nodeID, unit);
            this.m_stUnitArray.push(unit);
        }
    }

    /**
     * 通过id获得对应的node
     * @param unitID node的ID
     */
    public GetUnitByID(unitID: number): Unit 
    {
        let node = this.m_stUnitMap.get(unitID);
        if(!node) 
        {
            cc.error("UnitMgr申请了一个不存在的NodeID，请检查逻辑。id为", unitID);
        }
        else 
        {
            return node;
        }
    }
}