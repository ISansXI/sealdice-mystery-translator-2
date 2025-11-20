import { SealPack } from "../types/SealPack";

enum MODEL_INFO {
    NAME = "SealConfigRegister"
}

MODEL_INFO;

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    ctx; msg; cmdArgs; ext; // 无作用
    // 在此注册配置项
    seal.ext.registerTemplateConfig(ext, "rulesData", [
        "人|1|-|-|-|-",
        "猫|1|喵|呜|咪|哈]",
        "狗|1|嗷|呜|汪|呼"
    ]);
}

export {
    enter
}