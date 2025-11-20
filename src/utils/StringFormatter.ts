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

/**
 * 从字符串中提取第 N 个空格之后的所有内容。
 *
 * @param inputStr - 输入的原始字符串。
 * @param n - 想要跳过的空格数量。函数将返回第 N 个空格之后的所有内容。
 * @returns 第 N 个空格之后的子字符串。如果空格数量不足 N 个，则返回 null。
 */
function getContentAfterNthSpace(inputStr: string, n: number): string | null {
    if (typeof inputStr !== 'string') {
        throw new TypeError('输入必须是字符串类型');
    }
    if (!Number.isInteger(n) || n < 1) {
        throw new Error('n 必须是大于等于 1 的整数');
    }

    // 正则表达式解析：
    // ^                     - 匹配字符串的开头。
    // (?:\S+\s){n}          - 这是一个非捕获组，匹配模式 (非空字符串 + 空格) 恰好 n 次。
    //   (?: ... )           - 非捕获组，只用于分组，不捕获结果。
    //   \S+                 - 匹配一个或多个非空格字符。
    //   \s                  - 匹配一个空格。
    //   {n}                 - 量词，前面的分组必须出现 exactly n 次。
    // ([\s\S]*)             - 捕获组，匹配第 n 个空格之后的所有内容（包括空格和换行）。
    // $                     - 匹配字符串的末尾。

    // 使用 RegExp 构造函数动态创建正则表达式
    const regex = new RegExp(`^(?:\\S+\\s){${n}}([\\s\\S]*)$`);

    const match = inputStr.match(regex);

    // 如果匹配成功，返回捕获到的内容；否则返回 null
    if (match && match[1] !== undefined) {
        return match[1];
    }

    return null;
}

export {
    formatString as fS,
    getContentAfterNthSpace
}