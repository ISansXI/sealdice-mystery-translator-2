import { Config } from "../misc/Config";
import { showError } from "./Logger";

enum MODEL_INFO {
    NAME = "DataController"
}

MODEL_INFO;

/**
 * 深度检查一个对象是否可以被安全地序列化为 JSON。
 * 这个函数会尝试序列化对象，并检查过程中是否遇到了 undefined 或函数。
 * @param obj - 需要验证的对象。
 * @returns 如果对象可以被安全序列化，返回 true；否则返回 false。
 */
function isJsonSerializable(obj: unknown): boolean {
    // 基本类型的快速检查
    if (obj === null || typeof obj !== 'object') {
        // null, number, string, boolean 都是可序列化的
        return true;
    }

    try {
        // 使用 replacer 函数来检测无效值
        JSON.stringify(obj, (key, value) => {
            if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
                // 如果遇到 undefined、function 或 symbol，抛出错误
                throw new TypeError(`Cannot serialize ${typeof value === 'undefined' ? 'undefined' : typeof value === 'function' ? 'function' : 'symbol'}${key ? ' for key "' + key + '"' : ''}`);
            }
            return value;
        });
        return true;
    } catch (error) {
        // 捕获到循环引用或其他序列化错误
        showError(MODEL_INFO.NAME);
        return false;
    }
}

/**
 * 递归地获取或创建 Record 中指定路径的值。
 * 如果路径不存在，则创建该路径，并返回空值（或提供的默认值）。
 * 
 * @param obj - 要操作的 Record 对象。
 * @param path - 路径数组，例如 ['a', 'b', 'c']。
 * @param defaultValue - （可选）如果路径不存在，返回的默认值。默认为 undefined。
 * @returns 路径对应的的值，或者默认值。
 */
function fancyGet<T = any>(
    obj: Record<string, any>,
    path: string[],
    defaultValue?: T
): T {
    // 如果路径为空，返回默认值
    if (path.length === 0) {
        return defaultValue as T;
    }

    let current = obj;
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        const isLastKey = i === path.length - 1;

        // 如果当前键不存在，或者存在但不是对象（且不是最后一个键），则创建一个空对象
        if (!current.hasOwnProperty(key) || (typeof current[key] !== 'object' && current[key] !== null && !isLastKey)) {
            current[key] = isLastKey ? defaultValue : {};
        }

        // 如果是最后一个键，返回其值（可能是刚创建的默认值）
        if (isLastKey) {
            return current[key] as T;
        }

        // 否则，继续向下遍历
        current = current[key];
    }

    // 理论上不会到达这里，除非路径为空
    return defaultValue as T;
}

function initData(data: Record<any, any>) {
    // data初始化逻辑
    if(data == null) {
        data = {};
    }
    return data;
}

function getData(ext: seal.ExtInfo, _kwargs?: Record<any, any>, ..._args:any): Record<any, any> {
    const dataBaseNamespace = Config.data_namespace;
    let data: Record<any, any> = JSON.parse(ext.storageGet(dataBaseNamespace));
    data = initData(data);

    return data;
}

function saveData(ext: seal.ExtInfo, data: Record<any, any>, _kwargs?: Record<any, any>, ..._args: any) {
    const dataBaseNamespace = Config.data_namespace;

    if(!isJsonSerializable(data)) {
        return;
    }

    ext.storageSet(dataBaseNamespace, JSON.stringify(data));
}

export {
    getData,
    saveData,
    fancyGet
}