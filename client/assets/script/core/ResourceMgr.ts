export class ResourceMgr 
{
    private m_stResMap: Map<string, any>;

    constructor() 
    {
        this.m_stResMap = new Map<string, any>();
    }

    /**
     * 加载资源
     * @param path url路径，从resources下一级开始 
     * @param callback 执行的回调函数
     */
    public LoadRes(path: string, callback: Function): void 
    {
        // TODO ... 按照资源类型来执行
        let res = this.m_stResMap.get(path);
        if(res) 
        {
            callback(res);
            return;
        }

        cc.loader.loadRes(path, (err, res) =>
        {
            this.m_stResMap.set(path, res);
            callback(res);
        });
    }
}