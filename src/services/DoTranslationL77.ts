import { SealPack } from "../types/SealPack";
import { getContentAfterNthSpace } from "../utils/StringFormatter";
import { getRecordKeysAsList } from "./ShowAvailableTranslators";

enum MODEL_INFO {
    NAME = "DoTranslation"
}

MODEL_INFO;

/**
 * LZ77压缩算法实现
 * @param data 输入字符串
 * @param windowSize 滑动窗口大小
 * @param lookaheadSize 前瞻缓冲区大小
 * @returns 压缩后的三元组数组 [长度, 偏移量, 下一个字符]
 */
function lz77Compress(data: string, windowSize: number = 15, lookaheadSize: number = 15): Array<[number, number, string]> {
    const result: Array<[number, number, string]> = [];
    let i = 0;
    const n = data.length;

    while (i < n) {
        let bestLength = 0;
        let bestOffset = 0;
        const windowStart = Math.max(0, i - windowSize);

        // 在滑动窗口中查找最长匹配
        for (let j = windowStart; j < i; j++) {
            let length = 0;
            while (length < lookaheadSize && i + length < n && data[j + length] === data[i + length]) {
                length++;
            }
            if (length > bestLength) {
                bestLength = length;
                bestOffset = i - j;
            }
        }

        // 如果找到有效匹配
        if (bestLength > 0) {
            const nextChar = i + bestLength < n ? data[i + bestLength] : '';
            result.push([bestLength, bestOffset, nextChar]);
            i += bestLength + 1;
        } else {
            // 没有找到匹配，直接添加当前字符
            result.push([0, 0, data[i]]);
            i++;
        }
    }

    return result;
}

/**
 * LZ77解压算法实现
 * @param data 压缩后的三元组数组
 * @returns 解压后的原始字符串
 */
function lz77Decompress(data: Array<[number, number, string]>): string {
    let result = '';

    for (const [length, offset, char] of data) {
        if (length > 0) {
            // 根据偏移量和长度复制之前的子串
            const start = result.length - offset;
            for (let i = 0; i < length; i++) {
                result += result[start + i];
            }
        }
        // 添加下一个字符
        if (char) {
            result += char;
        }
    }

    return result;
}

/**
 * 将压缩后的三元组转换为可映射的字符串
 * @param compressed 压缩后的三元组数组
 * @returns 编码字符串
 */
function compressToBinaryString(compressed: Array<[number, number, string]>): string {
    let result = '';
    for (const [length, offset, char] of compressed) {
        // 将长度和偏移量转换为4位二进制
        const lengthBin = length.toString(2).padStart(4, '0');
        const offsetBin = offset.toString(2).padStart(4, '0');
        // 字符转换为8位二进制
        const charCode = char.charCodeAt(0);
        const charBin = charCode.toString(2).padStart(8, '0');
        // 拼接
        result += lengthBin + offsetBin + charBin;
    }
    return result;
}

/**
 * 将二进制字符串转换回压缩后的三元组
 * @param binaryStr 二进制字符串
 * @returns 压缩后的三元组数组
 */
function binaryStringToCompressed(binaryStr: string): Array<[number, number, string]> {
    const result: Array<[number, number, string]> = [];
    let i = 0;
    const n = binaryStr.length;

    while (i < n) {
        // 提取4位长度
        const lengthBin = binaryStr.substr(i, 4);
        const length = parseInt(lengthBin, 2);
        i += 4;

        // 提取4位偏移量
        const offsetBin = binaryStr.substr(i, 4);
        const offset = parseInt(offsetBin, 2);
        i += 4;

        // 提取8位字符
        const charBin = binaryStr.substr(i, 8);
        const charCode = parseInt(charBin, 2);
        const char = String.fromCharCode(charCode);
        i += 8;

        result.push([length, offset, char]);
    }

    return result;
}

/**
 * 将任意字符串转换为其对应的二进制字符串表示。
 * 每个字符的二进制前会加上 '0b' 前缀以示区分，并用空格隔开。
 *
 * @param str - 需要转换的任意字符串。
 * @returns 转换后的二进制字符串。
 */
function stringToBinary(str: string): string {
    if (typeof str !== 'string') {
        throw new TypeError('输入必须是字符串类型');
    }

    let binary = '';
    for (let i = 0; i < str.length;) {
        const codePoint = str.codePointAt(i);
        if (codePoint !== undefined) {
            // 转换为二进制，不添加前缀，每个字符用16位表示
            binary += codePoint.toString(2).padStart(16, '0');
            i += codePoint <= 0xFFFF ? 1 : 2;
        } else {
            i++;
        }
    }
    return binary;
}

/**
 * 将由 stringToBinary 函数生成的二进制字符串转换回原始字符串。
 * 它会按空格分割二进制字符串，并忽略任何空字符串或无效的二进制值。
 *
 * @param binaryStr - 由空格分隔的二进制字符串，每个二进制串可带 '0b' 前缀。
 * @returns 转换回的原始字符串。
 */
function binaryToString(binaryStr: string): string {
    // 检查输入是否为有效字符串
    if (typeof binaryStr !== 'string') {
        throw new TypeError('输入必须是字符串类型');
    }

    // 如果是空字符串，直接返回
    if (binaryStr.trim() === '') {
        return '';
    }

    // 1. 按空格分割字符串，得到每个字符的二进制字符串数组
    // 使用 filter(Boolean) 过滤掉可能存在的空字符串（例如，由多个连续空格或首尾空格造成的）
    const binaryParts = binaryStr.split(' ').filter(Boolean);

    let result = '';

    for (const part of binaryParts) {
        try {
            // 2. 移除可能存在的 '0b' 前缀，并将二进制字符串转换为十进制的 Unicode 编码点
            // parseInt 的第二个参数 2 表示这是一个二进制数
            const codePoint = parseInt(part.startsWith('0b') ? part.slice(2) : part, 2);

            // 3. 检查转换是否成功（parseInt 失败会返回 NaN）
            if (isNaN(codePoint)) {
                throw new Error(`无效的二进制值: ${part}`);
            }

            // 4. 将 Unicode 编码点转换为字符，并追加到结果中
            result += String.fromCodePoint(codePoint);
        } catch (error) {
            // 如果遇到无效的二进制部分，可以选择忽略或抛出错误
            // 这里我们选择忽略，并在控制台打印警告，以增加函数的容错性
            console.warn(`跳过无效的二进制部分: "${part}". 错误: ${(error as Error).message}`);
        }
    }

    return result;
}

/**
 * 判断一个字符串是否仅由某 3 个不同的字符（可乱序）构成（忽略空格）。
 * 这 3 个字符都必须至少出现一次。
 *
 * @param str - 需要检查的字符串。
 * @returns 如果符合条件，返回 true；否则返回 false。
 */
function isComposedOfThreeUniqueChars(str: string): boolean {
    // 1. 检查输入是否为字符串
    if (typeof str !== 'string') {
        throw new TypeError('输入必须是字符串类型');
    }

    // 2. 过滤掉所有空格
    const nonSpaceStr = str.replace(/\s+/g, '');

    // 3. 如果过滤后字符串长度小于3，不可能由3个不同字符组成
    if (nonSpaceStr.length < 3) {
        return false;
    }

    // 4. 使用 Set 来获取所有不重复的字符
    const uniqueChars = new Set(nonSpaceStr);

    // 5. 检查唯一字符的数量是否恰好为 3
    return uniqueChars.size === 3;
}

function getSubstring(str: string, startIndex: number, length: number): string {
    // 计算结束索引
    const endIndex = startIndex + length;
    // 使用 slice 提取子字符串
    return str.slice(startIndex, endIndex);
}

function swapChar(mode: 'encode' | 'decode', rule: Array<string>, text: string): string {
    let result = "";
    if (mode === 'encode') {
        // 压缩文本
        const compressed = lz77Compress(text);
        const binaryStr = compressToBinaryString(compressed);

        // 映射为目标字符
        for (const char of binaryStr) {
            switch (char) {
                case '0':
                    result += rule[1];
                    break;
                case '1':
                    result += rule[2];
                    break;
                default:
                    result += rule[3];
            }
        }
    } else {
        // 解码时，先将目标字符映射回二进制
        let binaryStr = "";
        const step = parseInt(rule[0]);
        for (let i = 0; i < text.length; i += step) {
            const subString = text.substr(i, step);
            switch (subString) {
                case rule[1]:
                    binaryStr += "0";
                    break;
                case rule[2]:
                    binaryStr += "1";
                    break;
                default:
                    binaryStr += "0"; // 默认值，可根据实际情况调整
            }
        }

        // 解压二进制字符串
        const compressed = binaryStringToCompressed(binaryStr);
        result = lz77Decompress(compressed);
    }
    return result;
}

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    ctx; msg; cmdArgs; ext; // 无作用
    
    let rules = {};

    const ruleData = seal.ext.getTemplateConfig(ext, "rulesData");
    for(let a of ruleData) {
        let aa = a.split("|");
        rules[aa[0]] = [aa[1], aa[2], aa[3], aa[4], aa[5]];
    }

    //.trs do 1 XXXX

    const fromL = cmdArgs.getArgN(2);
    const toL = cmdArgs.getArgN(3);
    const textRaw = getContentAfterNthSpace(msg.message, 4);

    if (!getRecordKeysAsList(rules).includes(toL) || !getRecordKeysAsList(rules).includes(fromL)) {
        seal.replyToSender(ctx, msg, "不支持翻译这个语种哦");
        return;
    }

    let binaryText;
    let translatedText;
    // 人话
    if (toL === getRecordKeysAsList(rules)[0]) {
        binaryText = swapChar("decode", rules[fromL], textRaw);
        translatedText = binaryToString(binaryText);

    }
    // 非人话
    else {
        if (fromL !== getRecordKeysAsList(rules)[0]) {
            let binaryText1 = swapChar("decode", rules[fromL], textRaw);
            let translatedText1 = binaryToString(binaryText1);
            binaryText = stringToBinary(translatedText1);
            // 压缩二进制字符串后映射
            translatedText = swapChar("encode", rules[toL], binaryText);
        }
        else {
            binaryText = stringToBinary(textRaw);
            // 压缩二进制字符串后映射
            translatedText = swapChar("encode", rules[toL], binaryText);
        }
    }

    seal.replyToSender(ctx, msg, translatedText);
    return;
}

export {
    enter
}
