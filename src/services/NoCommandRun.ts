enum MODEL_INFO {
    NAME = "NoCommandRun"
}

MODEL_INFO;

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    // cmdArgs == null
    const rawMessage = msg.message;
    
}

export {
    enter
}