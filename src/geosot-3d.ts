/**
 * # GeoSOT-3D 算法来自猜测
 * GeoSOT-3D是在标准GBT+40087-2021规定的GeoSOT的基础上拓展出的，兼容GeoSOT的二维网格部分，
 * 但高度剖分规则和GeosOT中的不一样，GeoSOT为了使低海拔和高海拔的网格大小看起来都是正方体，采用了
 * 不等距的剖分规则，也就是同一级别中，低海拔的格子的高度和高海拔的高度不一样。GeoSOT-3D为了简化
 * 高度剖分规则，用的等距剖分规则。
 * 
 * 1. 高度和度的转换 https://www.doc88.com/p-1032310223771.html
 * 地心是0度，最高是512度，
 * 根据论文，度D与大地高的H是H = D * (2 * PI * a) * 1°/ 360° - b，其中a,b是长半轴和短半轴
 * D = ((H + b) * 180) / (a * PI)
 * 
 * 2. geosot-3d的python实现 https://github.com/giserHacter/GeoSOT/blob/main/GeoSoT.py
 * 3. geosot-3d的js实现 https://github.com/Piu-Lin/SmartEarth/blob/4b29254197656d62831d3fe698072a3b6bb0ba13/src/sot.js
 * 4. geosot-3d的java实现 https://github.com/KiktMa/geotrellis-cuts/blob/d18aa5662af45a760281ac68fa8c7aaa7f63b08b/src/main/java/com/geosot/javademo/geosot/ChangeCode.java
 * 5. geosot-3d的scala实现 https://github.com/protectione055/geosot/blob/b143acb3ecaec90ff6df74c54470de036e50ac3c/src/main/scala/top/ironmanzzm/geosot/MortonCode.scala
 * 6. 算法主要来自《A Set of Integral Grid-Coding Algebraic Operations Based on GeoSOT-3D》
 */

import { A, B, code2decimal, decimal2code, gridSize, MASK_32, MASK_5, MASK_96 } from "./utils";

type Binary3D = {
    lngBits: bigint, latBits: bigint, eleBits: bigint, level: number
}
type Binary1D = {
    binary1D: bigint,
    level: number
}
export function getSizeInMeters(level: number) {
    return gridSize[level] * A * (Math.PI / 180)
}
export function getSize(level: number) {
    return gridSize[level];
}
export function encode3d(lngBits: bigint, latBits: bigint, eleBits: bigint, level: number): bigint {
    return (lngBits << 69n) | (latBits << 37n) | (eleBits << 5n) | BigInt(level - 1);
}
export function decodeLevel(code3dOr1d: bigint): bigint {
    return (code3dOr1d & MASK_5) + 1n
}
export function decode3d(code3d: bigint): Binary3D {
    const level = Number(decodeLevel(code3d))
    const eleBits = (code3d >> 5n) & MASK_32
    const latBits = (code3d >> 37n) & MASK_32
    const lngBits = (code3d >> 69n) & MASK_32
    return { lngBits, latBits, eleBits, level }
}
export function encode1d(binary1D: bigint, level: number): bigint {
    return (binary1D << 5n) | BigInt(level - 1);
}
export function decode1d(code1d: bigint): Binary1D {
    const level = Number(decodeLevel(code1d))
    const binary1D = (code1d >> 5n) & MASK_96
    return { binary1D, level }
}
/**
 * 将经度、纬度和高度编码为一个二进制的三维编码
 *
 * @param lng - 经度，以度为单位。范围-180到180度
 * @param lat - 纬度，以度为单位。范围-90到90度
 * @param ele - 高度，以米为单位。距离椭球面的大地高
 * @param level - 网格级别，决定网格的分辨率。
 * @param radius - 地球半径的近似值，默认为6378137米。
 * @returns 一个二进制的三维编码对象
 */
export function encodeBinary3D(lng: number, lat: number, ele: number, level: number,): bigint {
    const lngBits = BigInt(decimal2code(lng))
    const latBits = BigInt(decimal2code(lat))
    const D = ((ele + B) * 180) / (A * Math.PI)//海拔转为度
    const eleBits = BigInt(decimal2code(D))
    return encode3d(lngBits, latBits, eleBits, level)
}
/**
 * 将一个二进制的三维编码解码回经度、纬度和高度
 *
 * @param binary3D - 一个二进制的三维编码对象
 * @returns 一个包含经度、纬度和高度的对象
 */
export function decodeBinary3D(binary3d: bigint) {
    const { lngBits, latBits, eleBits } = decode3d(binary3d);
    const lng = code2decimal(lngBits)
    const lat = code2decimal(latBits)
    const D = code2decimal(eleBits)
    const H = D * A * (Math.PI / 180) - B//度转为海拔
    return { lng, lat, ele: H }
}
/**
 * 将经度、纬度和高度编码为一个二进制的一维编码
 *
 * @param lng - 经度，以度为单位。范围-180到180度
 * @param lat - 纬度，以度为单位。范围-90到90度
 * @param ele - 高度，以米为单位。距离椭球面的大地高
 * @param level - 网格级别，决定网格的分辨率。
 * @param radius - 地球半径的近似值，默认为6378137米。
 * @returns 一个二进制的一维编码
 */
export function encodeBinary1D(lng: number, lat: number, ele: number, level: number,) {
    const code3d = encodeBinary3D(lng, lat, ele, level);
    return binary3DToBinary1D(code3d)
}
/**
 * 将经度、纬度和高度编码为一个八进制的一维编码
 *
 * @param lng - 经度，以度为单位。范围-180到180度
 * @param lat - 纬度，以度为单位。范围-90到90度
 * @param ele - 高度，以米为单位。距离椭球面的大地高
 * @param level - 网格级别，决定网格的分辨率。
 * @param radius - 地球半径的近似值，默认为6378137米。
 * @returns 一个八进制的一维编码，包括经度、纬度和高度的八进制表示
 */
export function encodeOctal1D(lng: number, lat: number, ele: number, level: number,): string {
    const code3d = encodeBinary3D(lng, lat, ele, level);
    return binary3DToOctal1D(code3d);
}
/**
 * 将一个二进制的一维编码解码回经度、纬度和高度
 *
 * @param binary1D - 一个二进制的一维编码对象
 * @returns 一个包含经度、纬度和高度的对象
 */
export function decodeBinary1D(binary1D: bigint) {
    const binary3D = binary1DToBinary3D(binary1D)
    return decodeBinary3D(binary3D);
}
/**
 * 将一个八进制的一维编码解码回经度、纬度和高度
 *
 * @param octal1D - 一个八进制的一维编码对象
 * @returns 一个包含经度、纬度和高度的对象
 */

export function decodeOctal1D(octal1D: string) {
    const binary3D = octal1DToBinary3D(octal1D)
    return decodeBinary3D(binary3D);
}
/**
 * 二进制三维编码转为二进制一维编码 
 * @param binary3D 
 * @returns 二进制一维编码 ele+lat+lon
 */
export function binary3DToBinary1D(binary3D: bigint) {
    const { lngBits, latBits, eleBits, level } = decode3d(binary3D);
    let binary1D = 0n;
    for (let i = 0n; i < 32n; i++) {
        let offset = 3n * i;
        binary1D |= ((lngBits >> i) & 1n) << offset;
        binary1D |= ((latBits >> i) & 1n) << (offset + 1n);
        binary1D |= ((eleBits >> i) & 1n) << (offset + 2n);
    }
    return encode1d(binary1D, level)
}
/**
 * 将一个二进制的一维编码解码回经度、纬度和高度的二进制表示
 *
 * @param binary1D - 一个二进制的一维编码对象
 * @returns 一个二进制的三维编码对象
 */
export function binary1DToBinary3D(binary1D: bigint): bigint {
    const { binary1D: code, level } = decode1d(binary1D);
    let lngBits = 0n;
    let latBits = 0n;
    let eleBits = 0n;
    for (let i = 0n; i < 32n; i++) {
        let offset = 3n * i;
        lngBits |= ((code >> offset) & 1n) << i;
        latBits |= ((code >> (offset + 1n)) & 1n) << i;
        eleBits |= ((code >> (offset + 2n)) & 1n) << i;
    }
    return encode3d(lngBits, latBits, eleBits, level)
}
/**
 * 将一个二进制的三维编码对象转换为八进制的一维编码对象
 * 
 * @param binary3D - 一个二进制的三维编码对象
 * @returns 一个八进制的一维编码对象
 *
 * 该函数将二进制的三维编码对象转换为八进制的一维编码对象。
 * 如果生成的八进制字符串长度小于level，那么将其补零到level位。
 * 如果生成的八进制字符串长度大于level，那么将其截断到level位。
 */
export function binary3DToOctal1D(binary3D: bigint) {
    const binary1D = binary3DToBinary1D(binary3D)
    return binary1DToOctal1D(binary1D)
}

export function binary1DToOctal1D(code1d: bigint): string {
    const { binary1D, level } = decode1d(code1d);
    let str = binary1D.toString(8);//八进制一维码和二进制一维码完全对应
    return str.padStart(32, "0").substring(0, level)
}
/**
 * 将一个八进制的一维编码对象转换为二进制的三维编码对象
 *
 * @param octal1D - 一个八进制的一维编码对象
 * @returns 一个二进制的三维编码对象
 */
export function octal1DToBinary3D(octal1D: string): bigint {
    //@ts-ignore
    const strs = octal1D.replaceAll(/[G\-\.]/g, "");
    let lngBits = 0n;
    let latBits = 0n;
    let eleBits = 0n;
    const level = strs.length;
    for (let i = 31n; i > 0n; i--) {
        let str = strs[Number(31n - i)]
        if (!str) continue
        const code = BigInt(parseInt(str, 8))
        lngBits |= (code & 1n) << i;
        latBits |= ((code >> 1n) & 1n) << i;
        eleBits |= ((code >> 2n) & 1n) << i;
    }
    return encode3d(lngBits, latBits, eleBits, level)
}

export function octal1DToBinary1D(octal1D: string): bigint {
    //@ts-ignore
    const strs = octal1D.replaceAll(/[G\-\.]/g, "");
    const level = strs.length;
    const binary1D = BigInt(strs)
    return encode1d(binary1D, level)
}

export const parent = parentByOctal1D;
/**
 * 获取一个八进制的一维编码对象的父级
 *
 * @param octal1D - 一个八进制的一维编码对象
 * @returns 一个八进制的一维编码对象的父级
 */

export function parentByOctal1D(octal1D: string) {
    const level = octal1D.length;
    return octal1D.substring(0, level - 1)
}

/**
 * 获取一个二进制的一维编码对象的父级
 *
 * @param binary1D - 一个二进制的一维编码对象
 * @returns 一个二进制的一维编码对象的父级
 */

export function parentByBinary1D(binary1D: bigint) {
    return parent(binary1DToOctal1D(binary1D))
}

const offsetBits = {
    lng: 69n,
    lat: 37n,
    ele: 5n
}
/**
 * 沿经度、纬度、高度移动网格码，生成一个新二进制三维码，相当于求一个网格码的邻居码
 * @param binary3D 二进制三位编码
 * @param dimension 要移动的维度，经度是lng，纬度方向是lat，高度方向是ele
 * @param offset 移动的距离，+代表向前，-代表向后，数值代表移动的距离
 */
export function moveBinary3D(binary3D: bigint, dimension: "lng" | "lat" | "ele", offset: number): bigint {
    return binary3D + (BigInt(offset) << ((31n - binary3D & MASK_5) + offsetBits[dimension]))
}
export type Offset = { x: number, y: number, z: number }
/**
 * 将一个二进制三维编码对象加上一个位移量，生成一个新的二进制三维编码对象。
 *
 * @param binary3D - 一个二进制的三维编码对象
 * @param offset - 一个对象，包含x, y, z三个维度的位移量。每个位移量是一个16位的有符号整数。
 * @returns 一个新的二进制的三维编码对象
 */

export function add(binary3D: bigint, offset: Offset): bigint {
    const shift = 31n - (binary3D & MASK_5);
    return binary3D
        + (BigInt(offset.x) << (shift + offsetBits.lng))
        + (BigInt(offset.y) << (shift + offsetBits.lat))
        + (BigInt(offset.z) << (shift + offsetBits.ele))
}

/**
 * 两个二进制三维编码对象的差值，返回一个 Offset 对象，包含x, y, z三个维度的差值。
 *
 * @param a - 一个二进制的三维编码对象
 * @param b - 一个二进制的三维编码对象
 * @returns 一个对象，包含x, y, z三个维度的差值
 */
export function sub(a: bigint, b: bigint): Offset {
    const shift = 31n - (a & MASK_5); // 提取级别（最低5位）
    const lngShift = offsetBits.lng + shift;
    const latShift = offsetBits.lat + shift;
    const eleShift = offsetBits.ele + shift
    const x = ((a >> lngShift) & MASK_32) - ((b >> lngShift) & MASK_32)
    const y = ((a >> latShift) & MASK_32) - ((b >> latShift) & MASK_32)
    const z = ((a >> eleShift) & MASK_32) - ((b >> eleShift) & MASK_32)
    return {
        x: Number(x),
        y: Number(y),
        z: Number(z)
    };
}


// export function euclideanDistance(a: bigint, b: bigint): number {
//     const level = decodeLevel(a)
//     const offset = sub(a, b)
//     const x = Math.abs(offset.x);
//     const y = Math.abs(offset.y);
//     const z = Math.abs(offset.z);
//     const size = getSize(Number(level))
//     const sizeInMeter = getSizeInMeters(Number(level))
//     const spanX = x * size;
//     const spanY = y * size;
//     const spanZ = z * sizeInMeter;
// }