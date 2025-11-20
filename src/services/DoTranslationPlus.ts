import { SealPack } from "../types/SealPack";
import { getContentAfterNthSpace } from "../utils/StringFormatter";
import { getRecordKeysAsList } from "./ShowAvailableTranslators";

enum MODEL_INFO {
    NAME = "DoTranslation"
}

MODEL_INFO;

// 定义默认规则
const DEFAULT_RULE: string[] = ['嗷', '呜', '啊', '~'];

// 编码：hexChar(0~f) → 两个兽音字符
function mapHexToBeast(rule: string[], hexChar: string, shift: number): string {
    if (!rule || rule.length < 4) {
        throw new Error('编码规则长度至少为 4，才能支持 16 种十六进制字符。');
    }
    const ruleLength = rule.length;

    const value = parseInt(hexChar, 16); // 0~15
    if (Number.isNaN(value)) {
        throw new Error(`非法的十六进制字符: ${hexChar}`);
    }

    // 把 0~15 映射为 ruleLength 进制的两位数
    const high = Math.floor(value / ruleLength); // 0 ~ ruleLength-1
    const low = value % ruleLength;             // 0 ~ ruleLength-1

    // 只用 shift 在 ruleLength 范围内的等价类
    const s = shift % ruleLength;

    const index1 = (high + s) % ruleLength;
    const index2 = (low + s) % ruleLength;

    return rule[index1] + rule[index2];
}

/**
 * 将兽音字符串的一部分映射回单个十六进制字符
 * @param rule 映射规则数组
 * @param beastPair 两个兽音字符组成的字符串
 * @param shift 当前的偏移量
 * @returns 对应的十六进制字符
 */
// 解码：两个兽音字符 → hex 字符
function mapBeastToHex(rule: string[], beastPair: string, shift: number): string {
    if (!rule || rule.length < 4) {
        throw new Error('解码规则长度至少为 4，才能支持 16 种十六进制字符。');
    }
    const ruleLength = rule.length;

    const index1 = rule.indexOf(beastPair[0]);
    const index2 = rule.indexOf(beastPair[1]);

    if (index1 === -1 || index2 === -1) {
        throw new Error(`解码失败，规则中不包含字符: ${beastPair}`);
    }

    // 只取 shift 在 0~ruleLength-1 范围内的等价类
    const s = shift % ruleLength;

    // 这里一定是非负数，再 % ruleLength 就不会是负的
    const high = (index1 - s + ruleLength) % ruleLength;
    const low = (index2 - s + ruleLength) % ruleLength;

    const value = high * ruleLength + low; // 理论上 0~15

    if (value < 0 || value > 15) {
        throw new Error(
            `[错误] 兽音字符对 ${beastPair} 解码得到的 value=${value} 超出十六进制范围，` +
            `可能不是当前规则/算法编码得到的文本。`
        );
    }

    return value.toString(16);
}

/**
 * 将兽音解码为文本 (无头部和尾部)
 * @param beastString 要解码的兽音字符串
 * @param rule 映射规则数组 (可选，默认使用 DEFAULT_RULE)
 * @returns 解码后的原始文本
 */
function decodeFromBeastSpeak(beastString: string, rule: string[] = DEFAULT_RULE): string {
    if (!beastString) return '';
    if (!rule || rule.length === 0) {
        throw new Error('解码规则不能为空。');
    }
    if (beastString.length % 8 !== 0) {
        throw new Error(`无效的兽音字符串，长度应为 8 的倍数。当前长度: ${beastString.length}`);
    }

    let text = '';
    let shift = 0;

    // 遍历兽音字符串，每次处理8个字符 (对应一个原始字符)
    for (let i = 0; i < beastString.length; i += 8) {
        const hexBeastChunk = beastString.slice(i, i + 8);
        let hex = '';

        // 遍历这8个字符中的每一对 (共4对，对应4个十六进制字符)
        for (let j = 0; j < hexBeastChunk.length; j += 2) {
            const beastPair = hexBeastChunk.slice(j, j + 2);

            // 使用当前的 shift 来解码每一对
            const hexChar = mapBeastToHex(rule, beastPair, shift);
            hex += hexChar;

            // 解码出一个 hexChar 后，立即更新 shift
            shift = (shift + parseInt(hexChar, 16)) % 100;
        }

        // 将4位十六进制字符串转换回Unicode字符
        const codePoint = parseInt(hex, 16);
        text += String.fromCodePoint(codePoint);
    }

    return text;
}

/**
 * 将文本编码为兽音 (无头部和尾部)
 * @param text 要编码的原始文本
 * @param rule 映射规则数组 (可选，默认使用 DEFAULT_RULE)
 * @returns 编码后的兽音字符串
 */
function encodeToBeastSpeak(text: string, rule: string[] = DEFAULT_RULE): string {
    if (!text) return '';
    if (!rule || rule.length === 0) {
        throw new Error('编码规则不能为空。');
    }

    let beastString = '';
    let shift = 0;

    for (const char of text) {
        const codePoint = char.codePointAt(0)!;
        const hex = codePoint.toString(16).padStart(4, '0');

        for (const hexChar of hex) {
            beastString += mapHexToBeast(rule, hexChar, shift);
            shift = (shift + parseInt(hexChar, 16)) % 100;
        }
    }

    return beastString;
}

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();

    // 1. 解析规则配置
    let rules: Record<string, string[]> = {};
    const ruleData = seal.ext.getTemplateConfig(ext, "rulesData");
    if (!ruleData || ruleData.length === 0) {
        seal.replyToSender(ctx, msg, "未找到翻译规则配置。");
        return;
    }
    for (let a of ruleData) {
        let aa = a.split("|");
        if (aa.length >= 6) { // 确保有足够的部分 (索引 0-5)
            rules[aa[0]] = [aa[2], aa[3], aa[4], aa[5]];
        } else {
            console.warn(`[警告] 规则配置格式不正确: ${a}`);
        }
    }

    const availableLanguages = getRecordKeysAsList(rules);
    if (availableLanguages.length === 0) {
        seal.replyToSender(ctx, msg, "未能解析任何有效的翻译规则。");
        return;
    }

    // 假设第一个语种是“原始文本”或“人话”
    const SOURCE_LANG = availableLanguages[0];

    // 2. 获取命令参数
    const fromL = cmdArgs.getArgN(2);
    const toL = cmdArgs.getArgN(3);
    const textRaw = getContentAfterNthSpace(msg.message, 4);

    // 3. 参数校验
    if (!fromL || !toL || !textRaw) {
        seal.replyToSender(ctx, msg, "参数错误，请检查命令格式。例如: .trs do 人 猫 你好");
        return;
    }
    if (!availableLanguages.includes(fromL) || !availableLanguages.includes(toL)) {
        seal.replyToSender(ctx, msg, `不支持的语种。支持的语种有: ${availableLanguages.join(', ')}`);
        return;
    }
    if (!rules[fromL] || !rules[toL]) {
        seal.replyToSender(ctx, msg, `内部错误：未能找到 '${fromL}' 或 '${toL}' 的规则。`);
        return;
    }

    // 4. 执行翻译
    let translatedText: string;
    try {
        let intermediateText = textRaw;

        // 如果源语种不是“人话”，则先解码
        if (fromL !== SOURCE_LANG) {
            // console.log(`[调试] 正在从 ${fromL} 解码: ${intermediateText}`);
            intermediateText = decodeFromBeastSpeak(intermediateText, rules[fromL]);
            // console.log(`[调试] 解码结果: ${intermediateText}`);
        }

        // 如果目标语种是“人话”，则结果就是中间文本
        if (toL === SOURCE_LANG) {
            translatedText = intermediateText;
        }
        // 否则，需要编码
        else {
            // console.log(`[调试] 正在编码到 ${toL}: ${intermediateText}`);
            translatedText = encodeToBeastSpeak(intermediateText, rules[toL]);
            // console.log(`[调试] 编码结果: ${translatedText}`);
        }

    } catch (error) {
        // 捕获解码或编码过程中可能出现的错误（如无效的兽音字符串）
        console.error("翻译过程中出错:", error);
        seal.replyToSender(ctx, msg, `翻译失败: ${(error as Error).message}`);
        return;
    }

    // 5. 发送结果
    seal.replyToSender(ctx, msg, translatedText);
}

export {
    enter
}