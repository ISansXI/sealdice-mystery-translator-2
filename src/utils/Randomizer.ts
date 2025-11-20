enum MODEL_INFO {
    NAME = "Randomizer"
}

MODEL_INFO;

/**
 * 生成一个在闭区间 [min, max] 内的随机整数。
 * 
 * @param min - 区间的最小值（包含）。
 * @param max - 区间的最大值（包含）。
 * @returns 一个在 [min, max] 之间的随机整数。
 * @throws {Error} 如果 min 大于 max，则抛出错误。
 */
function getRandomInt(min: number, max: number): number {
    // 确保 min 和 max 是整数，避免传入小数导致的问题
    const floorMin = Math.floor(min);
    const floorMax = Math.floor(max);

    if (floorMin > floorMax) {
        throw new Error("最小值不能大于最大值。");
    }

    // Math.random() 生成 [0, 1) 的随机数
    // 乘以 (floorMax - floorMin + 1) 得到 [0, floorMax - floorMin + 1) 的随机数
    // Math.floor() 将其向下取整，得到 [0, floorMax - floorMin] 的整数
    // 最后加上 floorMin，得到 [floorMin, floorMax] 的整数
    return Math.floor(Math.random() * (floorMax - floorMin + 1)) + floorMin;
}

/**
 * 生成一个在闭区间 [min, max] 内，并保留指定小数位数的随机数。
 * 
 * @param min - 区间的最小值（包含）。
 * @param max - 区间的最大值（包含）。
 * @param decimalPlaces - 要保留的小数位数。
 * @returns 一个在 [min, max] 之间并保留 x 位小数的随机数。
 * @throws {Error} 如果 min 大于 max，或 decimalPlaces 不是非负整数，则抛出错误。
 */
function getRandomNumberWithDecimals(min: number, max: number, decimalPlaces: number): number {
    if (min > max) {
        throw new Error("最小值不能大于最大值。");
    }
    if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
        throw new Error("小数位数必须是非负整数。");
    }

    // Math.random() 生成 [0, 1) 的随机数
    // 乘以 (max - min) 得到 [0, max - min) 的随机数
    // 加上 min，得到 [min, max) 的随机数
    const randomNum = Math.random() * (max - min) + min;

    // 使用 toFixed() 将数字四舍五入到指定的小数位数
    // toFixed() 返回一个字符串，所以需要用 Number() 转换回数字
    return Number(randomNum.toFixed(decimalPlaces));
}

export {
    getRandomInt as gRI,
    getRandomNumberWithDecimals as gRNWD
}