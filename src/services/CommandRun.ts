import { SealPack } from "../types/SealPack";
import * as ShowAvailableTranslators from "./ShowAvailableTranslators";
import * as DoTranslation from "./DoTranslation";
import * as DoTranslationAES from "./DoTranslationAES";
import * as DoTranslationL77 from "./DoTranslationL77";
import * as DoTranslationPlus from "./DoTranslationPlus";

enum MODEL_INFO {
    NAME = "CommandRun"
}

MODEL_INFO;

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    ctx; msg; cmdArgs; ext; // 无作用

    const ret = seal.ext.newCmdExecuteResult(true);

    switch(cmdArgs.getArgN(1)) {
        case 'available':
        case 'a': {
            ShowAvailableTranslators.enter(sealPack);
            break;
        }
        case 'do': {
            DoTranslationPlus.enter(sealPack);
            break;
        }
        default: {
            ret.showHelp = true;
        }
    }

    return ret;
}

export {
    enter
}