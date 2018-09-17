import {GameLogic} from "../battle/GameLogic";

export default class Core
{
    private static m_pGameLogic: GameLogic;

    public static Init(): void 
    {
        this.m_pGameLogic = new GameLogic();
    }

    public static get GameLogic(): GameLogic 
    {
        return Core.m_pGameLogic;
    }
}
