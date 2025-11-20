enum MODEL_INFO {
    NAME = "StringFormatter"
}

MODEL_INFO;

/**
 * 将字符串中的所有 "%s" 占位符按顺序替换为提供的参数。
 * 如果参数数量多于占位符，多余的参数将被忽略。
 * 如果参数数量少于占位符，多余的占位符将保持不变。
 * 
 * @param str 需要进行替换的原始字符串。
 * @param args 用于替换 "%s" 的值。
 * @returns 替换后的新字符串。
 */
function formatString(str: string, ...args: any[]): string {
    let index = 0;
    return str.replace(/%s/g, () => {
        // 如果还有可用的参数，就返回下一个参数的字符串形式，否则返回原始的 "%s"
        return index < args.length ? String(args[index++]) : '%s';
    });
}

export {
    formatString as fS
}