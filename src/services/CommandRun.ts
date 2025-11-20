import { SealPack } from "../types/SealPack";
import * as ShowAvailableTranslators from "./ShowAvailableTranslators";

enum MODEL_INFO {
    NAME = "CommandRun"
}

MODEL_INFO;

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    ctx; msg; cmdArgs; ext; // 无作用

    switch(cmdArgs.getArgN(1)) {
        case 'available':
        case 'a': {
            ShowAvailableTranslators.enter(sealPack);
            break;
        }
        case 'do': {
            
            break;
        }
        default: {
            return;
        }
    }
}

export {
    enter
}