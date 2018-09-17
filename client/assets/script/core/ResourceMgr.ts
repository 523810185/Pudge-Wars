export class ResourceMgr 
{
    private m_stResMap: Map<string,any>;

    constructor() 
    {
        this.m_stResMap = new Map<string,any>();
    }

    public LoadRes(path: string,callback: Function): void 
    {
        let res = this.m_stResMap.get(path);
        if(res != null) 
        {
            return res;
        }

        cc.loader.loadRes(path,(res) =>
        {
            this.m_stResMap.set(path,res);
            callback(res);
        });
    }
}