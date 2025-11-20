import { SealPack } from "../types/SealPack";

enum MODEL_INFO {
    NAME = "NoCommandRun"
}

MODEL_INFO;

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    ctx; msg; cmdArgs; ext; // 无作用

    // cmdArgs == null
    const rawMessage = msg.message;

}

export {
    enter
}