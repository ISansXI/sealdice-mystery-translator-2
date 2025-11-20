import { SealPack } from "../types/SealPack";
import { getContentAfterNthSpace } from "../utils/StringFormatter";
import { getRecordKeysAsList } from "./ShowAvailableTranslators";

enum MODEL_INFO {
    NAME = "DoTranslation"
}

MODEL_INFO;

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

    let binaryParts: string[] = []; // 使用数组来存储每个字符的二进制串

    for (let i = 0; i < str.length;) {
        const codePoint = str.codePointAt(i);
        if (codePoint !== undefined) {
            // 将每个字符的二进制表示作为一个独立的元素存入数组
            binaryParts.push(`0b${codePoint.toString(2)}`);
            // 根据码点是否为BMP字符，决定i递增1还是2
            i += codePoint <= 0xFFFF ? 1 : 2;
        } else {
            i++;
        }
    }

    // 使用空格将数组中的所有元素连接成一个字符串
    return binaryParts.join(' ');
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

const rules = {
    // 语种: [表示0, 表示1, 表示b和B]
    "人": [1, '-', '-', '-'],
    "猫": [1, '喵', '呜', '咪'],
    "狗": [1, '嗷', '呜', '汪']
}

function getSubstring(str: string, startIndex: number, length: number): string {
    // 计算结束索引
    const endIndex = startIndex + length;
    // 使用 slice 提取子字符串
    return str.slice(startIndex, endIndex);
}

function swapChar(mode: 'encode' | 'decode', rule: Array<string>, text: string): string {
    let step;

    let result = "";
    if(mode === 'encode') {
        // 翻译到不是人话的时候
        step = 1;
        for (let i = 0; i < text.length; i+= step) {
            const char = text[i];
            switch(char) {
                case '0': {
                    result += rule[1];
                    break;
                }
                case '1': {
                    result += rule[2];
                    break;    
                }
                case ' ': {
                    result += ' ';
                    break;
                }
                default: {
                    result += rule[3];
                }
            }
        }
    }
    else {
        // 翻译到是人话的时候
        step = rule[0];
        for (let i = 0; i < text.length; i += step) {
            const subString = getSubstring(text, i, step);
            switch (subString) {
                case rule[1]: {
                    result += "0";
                    break;
                }
                case rule[2]: {
                    result += "1";
                    break;
                }
                case rule[3]: {
                    result += "b";
                    break;
                }
                default: {
                    result += " ";
                }
            }
        }
    }
    console.log (result);
    return result;
}

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    ctx; msg; cmdArgs; ext; // 无作用

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
            translatedText = swapChar("encode", rules[toL], binaryText);
        }
        else {
            binaryText = stringToBinary(textRaw);
            translatedText = swapChar("encode", rules[toL], binaryText);
        }
    }
    
    seal.replyToSender(ctx, msg, translatedText);
    return;
}

export {
    enter,
    rules
}
