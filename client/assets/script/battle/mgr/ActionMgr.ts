import Core from "../../core/Core";

export class ActionMgr 
{
    constructor()
    {

    }

    /**
     * 英雄移动
     * @param heroID 英雄id 
     * @param pos 移动位置
     */
    public HeroMove(heroID: number,pos: cc.Vec2): void 
    {
        let node = Core.GameLogic.ObjMgr.GetNodeByID(heroID);
        node.position = pos;
    }
}