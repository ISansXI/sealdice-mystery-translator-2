import { SealPack } from "../types/SealPack";
import { gLT } from "../utils/I18n";
import { getListStringByPage } from "../utils/ListFormatter";
import { rules } from "./DoTranslation";

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

    const page = parseInt(cmdArgs.getArgN(2)) || 1;
    const text = getListStringByPage(getRecordKeysAsList(rules), page, 999, gLT("available_languages"));

    seal.replyToSender(ctx, msg, text);

    return;
}

export {
    enter,
    getRecordKeysAsList
}