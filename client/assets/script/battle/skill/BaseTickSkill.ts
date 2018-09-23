export interface BaseTickSkill 
{

    /**更新 */
    Update(): void;

    /**是否已经结束 */
    IsFinished(): boolean;

    /**清空 */
    Clear(): void;
}