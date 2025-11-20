import { Config } from "./misc/Config";
import * as CommandRun from "./services/CommandRun";
import * as NoCommandRun from "./services/NoCommandRun";
import * as SealConfigRegister from "./services/SealConfigRegister";
import { gLT } from "./utils/I18n";
import { fS } from "./utils/StringFormatter";

console.log(fS(gLT("loading_ext"), Config.ext_name));
// 创建扩展
let ext = seal.ext.find(Config.ext_name);
if (!ext) {
  ext = seal.ext.new(Config.ext_name, Config.author, Config.version);
  // 注册扩展
  seal.ext.register(ext);
}

// 编写指令
const cmdChatFramework = seal.ext.newCmdItemInfo();
cmdChatFramework.name = Config.ext_name;
cmdChatFramework.help = gLT("help_document_base");

cmdChatFramework.solve = (ctx, msg, cmdArgs) => {
  let sealPack = new SealPack(ctx, msg, cmdArgs, ext)
  let val = cmdArgs.getArgN(1);
  switch (val) {
    case 'help': {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
    default: {
      CommandRun.enter(sealPack);
      return seal.ext.newCmdExecuteResult(true);
    }
  }
}

// 注册非命令
if(Config.no_command_enabled) {
  ext.onNotCommandReceived = (ctx, msg) => {
    let sealPack = new SealPack(ctx, msg, null, ext)
    NoCommandRun.enter(sealPack);
  }
}

// 注册命令
for (let word of Config.awake_words) {
  ext.cmdMap[word] = cmdChatFramework;
}

// 注册配置项
SealConfigRegister.enter()

// 确认插件加载完毕
console.log(seal.ext.find(Config.ext_name) ? gLT("result_ok") : gLT("result_bad"));