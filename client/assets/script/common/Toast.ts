import Core from "../core/Core";

export function ShowToast(context: string): void 
{
    let pool = Core.PoolMgr.GetToastPool();
    let toast = pool.CheckOut();
    toast.getComponent(cc.Label).string = context;
    cc.find("Canvas").addChild(toast);
    setTimeout(() =>
    {
        pool.CheckIn(toast);
    }, 3000);
}

export class Toast 
{

}