export class CoreConfig 
{
    // 舞台的尺寸
    public static CANVAS_WIDTH: number = 960;
    public static CANVAS_HEIGHT: number = 640;

    // 是否是单机模式
    public static SINGLE_MODEL: boolean = true;

    // test
    public static MY_HERO_ID: number = 1;
    public static TEST_ANIME_ID: number = 2;

    public static SKILL_NULL: number = 0;
    public static SKILL_HOOK: number = 1; // 钩子
    public static SKILL_SPEED_UP: number = 2; // 加速
    public static SKILL_FIRE_AROUND: number = 3; // 灼烧
    public static SKILL_ICE_DART_SCATTER: number = 4; // 散射的冰镖
    public static SKILL_ICE_WIND: number = 5;         // 罡风护体
    public static SKILL_FLASH_AWAY: number = 6;     // 闪现
    public static SKILL_THUNDER_STRIKE: number = 7;  // 雷霆一击
    public static SKILL_AVATAR: number = 8;         // 天神下凡
    public static SKILL_GALAXY_VORTEX = 9;         // 星河涡流

    // UI层级
    public static Z_INDEX_UI: number = 100;
    public static Z_INDEX_BACKGROUND: number = -100;

    // 服务器地址
    public static SERVER_HOST: string = 'http://118.25.76.185:5000';
    // public static SERVER_HOST: string = 'http://192.168.43.138:5000';
}