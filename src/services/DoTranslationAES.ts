import { SealPack } from "../types/SealPack";
import { getContentAfterNthSpace } from "../utils/StringFormatter";
import CryptoJS from 'crypto-js';

// =================================================================
//  --- 修复：为 crypto-js 提供随机数生成器后备 ---
// =================================================================
// @ts-ignore
const hasNativeCrypto = typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';

if (!hasNativeCrypto) {
    console.warn('警告: 原生 crypto 模块不可用。将使用非加密安全的随机数生成器。');

    // @ts-ignore
    CryptoJS.lib.WordArray.random = function (size: number): CryptoJS.lib.WordArray {
        const array = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return CryptoJS.lib.WordArray.create(array);
    };
}

// =================================================================
//  --- 核心AES加密/解密函数 (使用 crypto-js) ---
// =================================================================

// 建议将密钥存储在环境变量或安全的地方，不要硬编码在代码中
const AES_SECRET_KEY = 'db150e2e4a4f0c637131678d6952cb9fd68b0e970fe5feacf3f8b89863f3fbb6';

/**
 * 使用AES加密字符串
 * @param text 待加密的明文
 * @param key 加密密钥 (字符串)
 * @returns 加密后的Base64字符串
 */
function aesEncrypt(text: string, key: string): string {
    return CryptoJS.AES.encrypt(text, key).toString();
}

/**
 * 使用AES解密字符串
 * @param encryptedText 加密后的Base64字符串
 * @param key 解密密钥 (字符串)
 * @returns 解密后的明文
 */
function aesDecrypt(encryptedText: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// =================================================================
//  --- 你的规则和 swapChar 函数 (保持不变) ---
// =================================================================
type LanguageRule = any;

const rules: Record<string, LanguageRule> = {
    // ... (你的规则定义)
    "人": [1, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'],
    "猫": [1, '喵', '呜', '咪', '嗷', '喵呜', '呜咪', '咪嗷', '嗷喵', '喵咪', '呜嗷', '喵喵', '呜呜', '咪咪', '嗷嗷', '喵呜咪', '呜咪嗷', '咪嗷喵', '嗷喵喵', '喵呜呜', '呜咪咪', '咪嗷嗷', '嗷喵呜', '喵咪呜', '呜嗷咪', '咪喵嗷', '嗷呜喵', '喵呜喵', '呜咪呜', '咪嗷呜', '嗷喵喵', '喵呜咪', '呜咪嗷', '咪嗷喵', '嗷喵喵', '喵呜呜', '呜咪咪', '咪嗷嗷', '嗷喵呜', '喵咪呜', '呜嗷咪', '咪喵嗷', '嗷呜喵', '喵呜喵', '呜咪呜', '咪嗷呜', '嗷喵喵', '喵呜咪', '呜咪嗷', '咪嗷喵', '嗷喵喵', '喵呜呜', '呜咪咪', '咪嗷嗷', '嗷喵呜', '喵咪呜', '呜嗷咪', '咪喵嗷', '嗷呜喵', '喵呜喵', '呜咪呜', '咪嗷呜', '嗷喵喵'],
    "狗": [1, '汪', '吠', '嚎', '呲', '汪汪', '吠吠', '嚎嚎', '呲呲', '汪吠', '吠嚎', '嚎呲', '呲汪', '汪嚎', '吠呲', '汪吠嚎', '吠嚎呲', '嚎呲汪', '呲汪汪', '汪吠吠', '吠嚎嚎', '嚎呲呲', '呲汪吠', '汪吠嚎', '吠嚎呲', '嚎呲汪', '呲汪汪', '汪吠吠', '吠嚎嚎', '嚎呲呲', '呲汪吠', '汪吠嚎', '吠嚎呲', '嚎呲汪', '呲汪汪', '汪吠吠', '吠嚎嚎', '嚎呲呲', '呲汪吠', '汪吠嚎', '吠嚎呲', '嚎呲汪', '呲汪汪', '汪吠吠', '吠嚎嚎', '嚎呲呲', '呲汪吠', '汪吠嚎', '吠嚎呲', '嚎呲汪', '呲汪汪', '汪吠吠', '吠嚎嚎', '嚎呲呲', '呲汪吠', '汪吠嚎', '吠嚎呲', '嚎呲汪', '呲汪汪', '汪吠吠', '吠嚎嚎', '嚎呲呲', '呲汪吠']
};

const humanReversedRule: Record<string, string> = {};
for (let i = 0; i < rules["人"].length - 1; i++) {
    humanReversedRule[rules["人"][i + 1]] = rules["人"][i + 1];
}

function getSupportedLanguages(): string[] {
    return Object.keys(rules);
}

function swapChar(mode: 'encode' | 'decode', lang: string, text: string): string {
    const rule = rules[lang];
    if (!rule) {
        throw new Error(`不支持的语种: ${lang}`);
    }

    const step = rule[0];
    let result = "";

    if (mode === 'encode') {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '=') {
                result += '=';
                continue;
            }
            const index = rule.indexOf(char, 1);
            if (index !== -1) {
                result += rule[index];
            } else {
                result += char;
            }
        }
    } else { // decode
        const reversedRule: Record<string, string> = {};
        if (lang === "人") {
            Object.assign(reversedRule, humanReversedRule);
        } else {
            for (let i = 0; i < rule.length - 1; i++) {
                reversedRule[rule[i + 1]] = rules["人"][i + 1];
            }
        }

        let i = 0;
        while (i < text.length) {
            if (text[i] === '=') {
                result += '=';
                i++;
                continue;
            }

            let found = false;
            const subString = text.slice(i, i + step);
            if (reversedRule[subString]) {
                result += reversedRule[subString];
                i += step;
                found = true;
            } else {
                if (reversedRule[text[i]]) {
                    result += reversedRule[text[i]];
                } else {
                    result += text[i];
                }
                i++;
            }
        }
    }
    return result;
}


// =================================================================
//  --- 主逻辑入口 (保持不变) ---
// =================================================================

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs } = sealPack.unPack();

    const fromL = cmdArgs.getArgN(2);
    const toL = cmdArgs.getArgN(3);
    const textRaw = getContentAfterNthSpace(msg.message, 4);

    const supportedLangs = getSupportedLanguages();
    if (!supportedLangs.includes(toL) || !supportedLangs.includes(fromL)) {
        seal.replyToSender(ctx, msg, `不支持的语种。支持的语种有: ${supportedLangs.join(', ')}`);
        return;
    }

    let finalText = "";

    try {
        if (fromL === "人" && toL !== "人") {
            const encryptedBase64 = aesEncrypt(textRaw, AES_SECRET_KEY);
            finalText = swapChar("encode", toL, encryptedBase64);
        } else if (fromL !== "人" && toL === "人") {
            const encryptedBase64 = swapChar("decode", fromL, textRaw);
            finalText = aesDecrypt(encryptedBase64, AES_SECRET_KEY);
        } else if (fromL !== "人" && toL !== "人") {
            const encryptedBase64 = swapChar("decode", fromL, textRaw);
            finalText = swapChar("encode", toL, encryptedBase64);
        } else {
            finalText = "你这不是废话吗？";
        }
    } catch (error) {
        console.error("翻译/加密/解密过程中出错:", error);
        finalText = "翻译失败！可能是输入格式不正确或密钥错误。";
    }

    seal.replyToSender(ctx, msg, finalText);
    return;
}

export {
    enter,
    rules
};