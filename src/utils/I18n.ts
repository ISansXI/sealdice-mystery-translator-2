import { LOCALIZATION, LOCALIZATION_OPTION } from "../misc/Locale";

enum MODEL_INFO {
    NAME = "I18n"
}

MODEL_INFO;

/**
 * 根据指定的键和语言代码，从本地化文件中获取对应的文本。
 * 该函数具有健壮性，会处理各种边界情况。
 *
 * @param key - 要查找的文本键。
 * @param language - 目标语言代码 (例如: 'cn_zh', 'en')。如果未提供，则使用 LOCALIZATION_OPTION 中设置的默认语言。
 * @returns 找到的本地化文本，如果找不到则返回一个带有占位符的默认字符串。
 */
function getLocalizedText(key: string, language?: string): string {
    // 1. 检查 key 是否有效
    if (!key || typeof key !== 'string') {
        console.warn(`[getLocalizedText] 无效的 key: ${key}`);
        return `[Missing Key: ${key}]`;
    }

    // 2. 确定要使用的语言，如果未提供，则使用默认语言
    const targetLanguage = language || LOCALIZATION_OPTION.language;

    // 3. 检查目标语言是否存在于 LOCALIZATION 对象中
    if (!targetLanguage || typeof targetLanguage !== 'string' || !LOCALIZATION.hasOwnProperty(targetLanguage)) {
        console.warn(`[getLocalizedText] 无效或未找到的语言: ${targetLanguage}`);
        return `[Missing Language: ${targetLanguage} for Key: ${key}]`;
    }

    const languagePack = LOCALIZATION[targetLanguage as keyof typeof LOCALIZATION];

    // 4. 检查 key 是否存在于语言包中
    if (!languagePack || !languagePack.hasOwnProperty(key)) {
        console.warn(`[getLocalizedText] 在语言 '${targetLanguage}' 中未找到 key: ${key}`);
        // 可以考虑返回 key 本身作为最后的 fallback，便于调试
        return `[Missing Translation: ${key} (${targetLanguage})]`;
    }

    // 5. 成功找到，返回文本
    return languagePack[key];
}

export {
    getLocalizedText as gLT
}