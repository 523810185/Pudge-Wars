import Core from "../core/Core";

let toastCnt: number = 0;
let toast: cc.Node;
let timer = new cc.Component();
let tickCnt = 0;
export function ShowToast(context: string): void 
{
    tickCnt = 0;
    let pool = Core.PoolMgr.GetPoolByName("Toast");
    if(toastCnt == 0) 
    {
        toast = pool.CheckOut();
        toast.getComponent(cc.Label).string = context;
        cc.find("Canvas").addChild(toast);
        timer.schedule(() =>
        {
            tickCnt++;
            if(tickCnt >= 10)
            {
                timer.unscheduleAllCallbacks();
                pool.CheckIn(toast);
                toastCnt--;
            }
        }, 0.3, cc.macro.REPEAT_FOREVER);
        toastCnt++;
    }
    else 
    {
        toast.getComponent(cc.Label).string = context;
    }
}

export class Toast 
{

}