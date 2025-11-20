class SealPack {
    public ctx: seal.MsgContext
    public msg: seal.Message
    public cmdArgs: seal.CmdArgs
    public ext: seal.ExtInfo

    constructor(ctx?: seal.MsgContext, msg?: seal.Message, cmdArgs?: seal.CmdArgs, ext?: seal.ExtInfo) {
        this.ctx = ctx;
        this.msg = msg;
        this.cmdArgs = cmdArgs;
        this.ext = ext;
    }

    unPack(): { ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs, ext: seal.ExtInfo } {
        return {ctx: this.ctx, msg: this.msg, cmdArgs: this.cmdArgs, ext: this.ext}
    }
}