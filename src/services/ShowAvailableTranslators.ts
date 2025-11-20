import { SealPack } from "../types/SealPack";
import { gLT } from "../utils/I18n";
import { getListStringByPage } from "../utils/ListFormatter";

enum MODEL_INFO {
    NAME = "ShowAvailableTranslators"
}

MODEL_INFO;

function getRecordKeysAsList(record: Record<string, any>): Array<string> {
    let result = [];
    for (const key in record) {
        result.push(key);
    }
    return result;
}

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    ctx; msg; cmdArgs; ext; // 无作用

    let rules = {};

    const ruleData = seal.ext.getTemplateConfig(ext, "rulesData");
    for (let a of ruleData) {
        let aa = a.split("|");
        rules[aa[0]] = [aa[1], aa[2], aa[3], aa[4], aa[5]];
    }

    const page = parseInt(cmdArgs.getArgN(2)) || 1;
    const text = getListStringByPage(getRecordKeysAsList(rules), page, 10, gLT("available_languages"));

    seal.replyToSender(ctx, msg, text);

    return;
}

export {
    enter,
    getRecordKeysAsList
}