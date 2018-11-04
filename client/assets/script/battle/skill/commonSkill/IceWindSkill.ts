import {BaseNormalSkill} from "../../common/BaseNormalSkill";
import {Unit} from "../../common/Unit";
import {LifeChangeSkill} from "../tickSkill/LifeChangeSkill";
import Core from "../../../core/Core";
import {DamageReduceSkill} from "../tickSkill/DamageReduceSkill";
import {DizzySkill} from "../tickSkill/DizzySkill";

export class IceWind implements BaseNormalSkill 
{
    /**生命值上升的数值 */
    private LIFE_CHANGE: number = 40;
    /**持续时间(单位：秒) */
    private DURATION_TIME: number = 17 / 12;
    /**减伤百分比 */
    private REDUCE_PERCENT: number = 75;
    /**动画资源url */
    private ANIMATION_URL: string = "prefabs/ice_wind";

    /**
     * 
     * @param unit 作用单位
     * @param durationTime 持续时间（单位：秒）
     */
    constructor(unit: Unit) 
    {
        let lifeUp = new LifeChangeSkill(unit, this.LIFE_CHANGE, this.DURATION_TIME);
        Core.TickMgr.AddTicker(lifeUp);
        let dmgReduce = new DamageReduceSkill(unit, this.REDUCE_PERCENT, this.DURATION_TIME);
        Core.TickMgr.AddTicker(dmgReduce);
        let dizzy = new DizzySkill(unit, this.DURATION_TIME);
        Core.TickMgr.AddTicker(dizzy);

        // view
        Core.ResourceMgr.LoadRes(this.ANIMATION_URL, (res) =>
        {
            let node: cc.Node = cc.instantiate(res);
            cc.find("Canvas").addChild(node);
            node.position = unit.GetNode().position;
            setTimeout(() =>
            {
                node.parent = null;
                node.destroy();
            }, this.DURATION_TIME * 1000);
        });
    }

    Init(): void
    {

    }
}