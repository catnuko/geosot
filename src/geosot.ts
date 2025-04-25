import * as morton from "./morton";
import { decimal2code, gridSize, isNumeric, code2decimal } from "./utils";
// export class GeoSOT {
//     radius: number;
//     constructor(options: {
//         radius: number
//     }) {
//         this.radius = options.radius || 6378137;
//     }
// }
/**
 * 经纬度转二进制编码
 * @param lng 经度，单位是度
 * @param lat 纬度，单位是度
 * @param level 层级
 * @returns 二进制编码
 */
export function encode2number(lng: number, lat: number, level: number): bigint {
    lng = decimal2code(lng)
    lat = decimal2code(lat)
    return morton.magicbits(lng, lat);
}
/**
 * 经纬度转四进制编码
 * @param lng 经度，单位是度
 * @param lat 纬度，单位是度
 * @param level 层级
 * @returns 四进制编码
 */
export function encode2string(lng: number, lat: number, level: number) {
    const num = encode2number(lng, lat, level)
    return toCode(num, level);
}
/**
 * 二进制编码转瓦片行列号
 * @param id 二进制编码
 * @param level 层级
 * @returns 瓦片行列号
 */
export function xyFromId(id: bigint, level: number) {
    const { l, b } = morton.inverseMagicbits(id);
    const x = l >> (32 - level)
    const y = b >> (32 - level)
    return { x, y }
}
/**
 * 经纬度转瓦片行列号
 * @param lng 经度，单位是度
 * @param lat 纬度，单位是度
 * @param level 层级
 * @returns 瓦片行列号
 */
export function xyFromLngLat(lng: number, lat: number, level: number) {
    const id = encode2number(lng, lat, level)
    return xyFromId(id, level)
}
/**
 * 四进制编码转瓦片行列号
 * @param code 四进制编码
 * @returns 瓦片行列号
 */
export function xyFromCode(code: string) {
    const { id, level } = toId(code);
    return xyFromId(id, level)
}

/**
 * 瓦片行列号转角点经纬度
 * @param x 瓦片行号
 * @param y 瓦片列号
 * @param level 层级
 * @returns 瓦片的经纬度
 */
export function cornerFromXY(x: number, y: number, level: number) {
    const cornerLng = code2decimal(x << 32 - level)
    const cornerLat = code2decimal(y << 32 - level)
    return { lng: cornerLng, lat: cornerLat }
}
/**
 * 瓦片id转瓦片角点经纬度
 * @param id 瓦片id
 * @param level 层级
 * @returns 瓦片的经纬度
 */
export function cornerFromId(id: bigint, level: number) {
    const { x, y } = xyFromId(id, level)
    return cornerFromXY(x, y, level)
}
/**
 * 经纬度转瓦片角点经纬度
 * @param lng 经度，单位是度
 * @param lat 纬度，单位是度
 * @param level 层级
 * @returns 瓦片的经纬度，瓦片的西南角
 */
export function cornerFromLngLat(lng: number, lat: number, level: number) {
    const id = encode2number(lng, lat, level)
    return cornerFromId(id, level)
}
/**
 * 经纬度转瓦片角点经纬度，简化版
 * @param lng 经度，单位是度
 * @param lat 纬度，单位是度
 * @param level 层级
 * @returns 瓦片的经纬度，瓦片的西南角
 */
export function cornerFromLngLatSimple(lng: number, lat: number, level: number) {
    const size = gridSize[level];
    const lng2 = Math.floor(lng / size) * size;
    const lat2 = Math.floor(lat / size) * size;
    return { lng: lng2, lat: lat2 }
}

/**
 * 四进制编码转瓦片角点经纬度
 * @param code 四进制编码
 * @returns 瓦片的经纬度，瓦片的西南角
 */
export function cornerFromCode(code: string) {
    const { id, level } = toId(code);
    return cornerFromId(id, level)
}
/**
 * 瓦片行列号转经纬度BoundingBox
 * @param x 瓦片行号
 * @param y 瓦片列号
 * @param level 层级
 * @returns 瓦片的经纬度BoundingBox
 */
export function bboxFromXY(x: number, y: number, level: number) {
    const cur = cornerFromXY(x, y, level)
    const next = cornerFromXY(x + 1, y + 1, level)
    const west = Math.min(cur.lng, next.lng);
    const south = Math.min(cur.lat, next.lat);
    const east = Math.max(cur.lng, next.lng);
    const north = Math.max(cur.lat, next.lat);
    return { west, south, east, north }
}
/**
 * 瓦片id转经纬度BoundingBox
 * @param id 瓦片id
 * @param level 层级
 * @returns 瓦片的经纬度BoundingBox
 */
export function bboxFromId(id: bigint, level: number) {
    const { x, y } = xyFromId(id, level)
    return bboxFromXY(x, y, level)
}
/**
 * 四进制编码转经纬度BoundingBox
 * @param code 四进制编码
 * @returns 瓦片的经纬度BoundingBox
 */
export function bboxFromCode(code: string) {
    const { id, level } = toId(code);
    return bboxFromId(id, level)
}
/**
 * 经纬度转经纬度BoundingBox
 * @param lng 经度，单位是度
 * @param lat 纬度，单位是度
 * @param level 层级
 * @returns 瓦片的经纬度BoundingBox
 */
export function bboxFromLngLat(lng: number, lat: number, level: number) {
    const id = encode2number(lng, lat, level)
    return bboxFromId(id, level)
}
/**
 * 经纬度转经纬度BoundingBox,简化版
 * @param lng 经度，单位是度
 * @param lat 纬度，单位是度
 * @param level 层级
 * @returns 瓦片的经纬度BoundingBox
 */
export function bboxFromLngLatSimple(lng: number, lat: number, level: number) {
    const p0 = cornerFromLngLat(lng, lat, level)
    const size = gridSize[level]
    const p1 = cornerFromLngLat(lng + size, lat + size, level)
    return { west: p0.lng, south: p0.lat, east: p1.lng, north: p1.lat }
}
/**
 * 获取第i级的经纬度网格的大小
 * @param i 级别
 * @returns 第i级的经纬度网格的大小，单位是度
 */
export function getCellSizeInDegree(i: number) {
    if (i >= 0 && i <= 9) {
        return Math.pow(2, 9 - i);
    }
    if (i >= 10 && i <= 15) {
        return Math.pow(2, 15 - i) / 60;
    }
    if (i >= 16 && i <= 32) {
        return Math.pow(2, 21 - i) / 3600;
    }
}
/**
 * 将一个瓦片id转换成一个字符串编码
 * @param id 瓦片id
 * @param level 层级
 * @returns 瓦片id对应的字符串编码
 */
export function toCode(id: bigint, level: number): string {
    const sl = ["G"];
    for (let i = 31; i > 31 - level; i--) {
        const v = (id >> (BigInt(i) * 2n)) & 0x3n;
        sl.push(v.toString());
        if (i > 32 - level) {
            if (i == 23 || i == 17) {
                sl.push("-");
            }
            if (i == 11) {
                sl.push(".");
            }
        }
    }
    return sl.join("");
}
/**
 * 获取某个编码对应的级别
 * @param code 瓦片id对应的字符串编码
 * @returns 瓦片id对应的级别
 */
export function getLevel(code: string): number {
    return toId(code).level;
}
/**
 * 将一个字符串编码转换成一个瓦片id
 * @param code 瓦片id对应的字符串编码
 * @returns 瓦片id对应的id和级别
 */
export function toId(code: string): { id: bigint; level: number } {
    let level = 0;
    let id = 0n;
    for (const c of code) {
        if (isNumeric(c)) {
            const v = decodeChar(c);
            const shift = (31n - BigInt(level)) * 2n;
            id = id | (v << shift);
            level++;
        }
    }
    return { id, level };
}

//https://help.supermap.com/iDesktopX/zh//Tools/DataProcessing/vector/GeoSOTEncode3D.html
//https://atffang.github.io/2024/12/11/%E5%9C%B0%E7%90%83%E7%A9%BA%E9%97%B4%E7%BD%91%E6%A0%BC%E7%BC%96%E7%A0%81%E6%AD%A3%E5%8F%8D%E7%AE%97%E5%AE%9E%E7%8E%B0/
/**
 * 高度编码，
 * 1. 编码长度等于层级
 * 2. 编码的第一位是符号位，0表示地上，1表示地下
 * 3. 编码 = 符号位 + 网格索引n的二进制表示
 * @param elevation 高度
 * @param level 层级
 * @param r 地球半径
 * @returns 高度编码
 */
export function encodeElevation(elevation: number, level: number, r = 6378137) {
    const theta = gridSize[level] * Math.PI / 180;
    const theta0 = Math.PI / 180;
    const n = Math.floor(
        (theta0 / theta) *
        (Math.log((elevation + r) / r) / Math.log(1 + theta0))
    );
    const signCode = n < 0 ? "1" : "0";
    let codeEle = Math.abs(n).toString(2).padStart(level - 1, "0");
    codeEle = signCode + codeEle;
    return codeEle;
}

export function decodeElevation(codeEle: string, r = 6378137) {
    const level = codeEle.length;
    const sign = codeEle.charAt(0) === "0" ? 1 : -1;
    const n = sign * parseInt(codeEle.substring(1), 2);
    const theta = gridSize[level] * Math.PI / 180;
    const theta0 = Math.PI / 180;
    return Math.pow((1 + theta0), n * (theta / theta0)) * r - r;
}


export function decodeChar(c: string) {
    if (c == "1") return 1n;
    if (c == "2") return 2n;
    if (c == "3") return 3n;
    return 0n;
}
