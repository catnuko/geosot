
export function round(value: number, n: number) {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
}

export let DEGREE_PRECISION = 6;
export let SECOND_PRECISION = 4
export let HEIGHT_EXTENT = 50000000
export let A = 6378137
export let B = 6356752
export function initConstant(options: { a?: number, b?: number, heightExtent?: number, degreePresion?: number, secondPresion?: number }) {
    if (options.a) {
        A = options.a
    }
    if (options.b) {
        B = options.b
    }
    if (options.heightExtent) {
        HEIGHT_EXTENT = options.heightExtent
    }
    if (options.secondPresion) {
        SECOND_PRECISION = options.secondPresion
    }
    if (options.degreePresion) {
        DEGREE_PRECISION = options.degreePresion
    }
}
/**
 * 将坐标中的“度-分-秒”拼接为一个32位长的编码，度占8位，分和秒分别占6位，小数点后的数字精确到1/2048秒，占用11位
 */
export function decimal2code(dec: number) {
    let val = dec < 0.0 ? -dec : dec;
    let g = dec < 0.0 ? 1 : 0;
    let d = Math.floor(val);
    let dm = round((val - d) * 60.0, DEGREE_PRECISION);
    let m = Math.floor(dm);
    let seconds = round((dm - m) * 60.0, SECOND_PRECISION);
    let s = Math.floor(seconds);
    let dot_seconds = (seconds - s) * 2048.0;
    let s11 = Math.round(dot_seconds);
    return (g << 31) | (d << 23) | (m << 17) | (s << 11) | s11;
}
export function code2decimal(x: number) {
    const G = x >>> 31; // 1b
    const D = (x >>> 23) & 0xff; // 8b
    const M = (x >>> 17) & 0x3f; // 6b
    const S = (x >>> 11) & 0x3f; // 6b
    const S11 = x & 0x7ff; // 11b
    const s11 = round(S11 / 2048.0, SECOND_PRECISION);
    const seconds = S + s11;
    let degree = round(D + M / 60.0 + seconds / 3600.0, DEGREE_PRECISION);
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