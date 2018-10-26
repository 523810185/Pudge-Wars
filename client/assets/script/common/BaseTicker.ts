export interface BaseTicker 
{

    /**更新 */
    Update(): void;

    /**
     * 是否已经结束帧活动。默认每帧先调用Update再调用IsFinished。
     */
    IsFinished(): boolean;

    /**清空 */
    Clear(): void;
}