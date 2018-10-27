export class FloatNumHandler 
{
    /**
     * 一个静态的方法，用来返回一个浮点数保留若干位后的结果。
     * 为了保证帧同步中不会因为浮点数而出现误差，浮点数必须调用此函数再作为参数传递，
     * 而且为了统一起见应当尽量使用默认的digit参数
     * @param floatNumber 浮点数本身
     * @param digit 保留的位数，默认为3
     */
    public static PreservedTo(floatNumber: number, digit: number = 3): number
    {
        let base = Math.pow(10, digit);
        return (floatNumber * base >> 0) / base;
    }
}