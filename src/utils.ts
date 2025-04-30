
export function round(value: number, n: number) {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
}
export let A = 6378137
export let B = 6356752
export function initConstant(options: { a?: number, b?: number, }) {
    if (options.a) {
        A = options.a
    }
    if (options.b) {
        B = options.b
    }
}
/**
 * 将十进制的度转为一个32位长的编码，度占8位，分和秒分别占6位，小数点后的数字精确到1/2048秒，占用11位
 * 左侧第一个bit位是符号位，>=0为0，反之为1
 */
export function decimal2code(dec: number): bigint {
    let val = dec < 0.0 ? -dec : dec;
    let g = dec < 0.0 ? 1 : 0;
    let d = Math.floor(val);
    let dm = (val - d) * 60;
    let m = Math.floor(dm);
    let seconds = (dm - m) * 60.0;
    let s = Math.floor(seconds);
    let dot_seconds = (seconds - s) * 2048.0;
    let s11 = Math.floor(dot_seconds);
    return (BigInt(g) << 31n) | (BigInt(d) << 23n) | (BigInt(m) << 17n) | (BigInt(s) << 11n) | BigInt(s11);
}
export function code2decimal(x: bigint): number {
    const G = Number(x >> 31n); // 1b
    const D = Number((x >> 23n) & 0xffn); // 8b
    const M = Number((x >> 17n) & 0x3fn); // 6b
    const S = Number((x >> 11n) & 0x3fn); // 6b
    const S11 = Number(x & 0x7ffn); // 11b
    const s11 = S11 / 2048.0;
    const seconds = S + s11;
    let degree = D + M / 60.0 + seconds / 3600.0;
    if (G > 0) {
        degree = -degree;
    }
    return degree;
}
export function isNumeric(value: string) {
    return /^\d$/.test(value);
}
export const gridSize = [
    512,
    256,
    128,
    64,
    32,
    16,
    8,
    4,
    2,
    1,
    0.5333333333333333,
    0.26666666666666666,
    0.13333333333333333,
    0.0666666666666666,
    0.03333333333333333,
    0.016666666666666666,
    0.008888888888888889,
    0.0044444444444444444,
    0.0022222222222222222,
    0.0011111111111111111,
    0.0005555555555555556,
    0.0002777777777777778,
    0.0001388888888888889,
    0.00006944444444444444,
    0.00003472222222222222,
    0.00001736111111111111,
    0.000008680555555555556,
    0.000004340277777777778,
    0.000002170138888888889,
    0.0000010850694444444444,
    5.425347222222222e-7,
    2.712673611111111e-7,
    1.3563368055555556e-7,
]

export const MASK_5 = 0x1Fn;
export const MASK_32 = 0xFFFFFFFFn;
export const MASK_96 = 0xFFFFFFFFFFFFFFFFFFFFFFFFn;