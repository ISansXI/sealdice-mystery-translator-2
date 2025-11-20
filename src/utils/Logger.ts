import { gLT } from "./I18n"
import { fS } from "./StringFormatter"

enum MODEL_INFO {
    NAME = "Logger"
}

MODEL_INFO;

function showError(modelName: string = "unknown") {
    const text = fS(gLT("internal_error"), modelName);
    throw new Error(text);
    console.log(text);
}

export {
    showError
}