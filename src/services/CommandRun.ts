enum MODEL_INFO {
    NAME = "CommandRun"
}

MODEL_INFO;

function enter(sealPack: SealPack) {
    const { ctx, msg, cmdArgs, ext } = sealPack.unPack();
    switch(cmdArgs.getArgN(1)) {
        
        default: {
            return;
        }
    }
}

export {
    enter
}