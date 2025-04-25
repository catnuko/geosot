/**
 * 1. 高度和度的转换 https://www.doc88.com/p-1032310223771.html
 * 地心是0度，最高是512度，
 * 根据论文，度D与大地高的H是H = D * (2 * PI * a) * 1°/ 360° - b，其中a,b是长半轴和短半轴
 * D = ((H + b) * 180) / (a * PI)
 * 
 * 2. geosot-3d的python实现 https://github.com/giserHacter/GeoSOT/blob/main/GeoSoT.py
 * 3. geosot-3d的js实现 https://github.com/Piu-Lin/SmartEarth/blob/4b29254197656d62831d3fe698072a3b6bb0ba13/src/sot.js
 * 4. geosot-3d的java实现 https://github.com/KiktMa/geotrellis-cuts/blob/d18aa5662af45a760281ac68fa8c7aaa7f63b08b/src/main/java/com/geosot/javademo/geosot/ChangeCode.java
 * 5. geosot-3d的scala实现 https://github.com/protectione055/geosot/blob/b143acb3ecaec90ff6df74c54470de036e50ac3c/src/main/scala/top/ironmanzzm/geosot/MortonCode.scala
 */

import { A, B, code2decimal, decimal2code, HEIGHT_EXTENT } from "./utils";

export type Binary3D = {
    lngBits: bigint, latBits: bigint, eleBits: bigint, level: number
}
export type Binary1D = {
    binary1D: bigint,
    level: number
}
export type Octal1D = string;
/**
 * 将经度、纬度和高度标准化为离散的网格坐标。
 *
 * @param lng - 经度，以度为单位。范围-180到180度
 * @param lat - 纬度，以度为单位。范围-90到90度
 * @param ele - 高度，以米为单位。海拔高度
 * @param level - 网格级别，决定网格的分辨率。
 * @param radius - 地球半径的近似值，默认为6378137米。
 * @returns 一个包含标准化的经度、纬度和高度的对象。
 */

export function normalize(lng: number, lat: number, ele: number, level: number) {
    const strip = 2 ** level;
    return {
        lng: Math.floor(((lng + 180) / 360) * strip),
        lat: Math.floor(((lat + 90) / 180) * strip),
        ele: Math.floor(((ele + A) / HEIGHT_EXTENT) * strip)
    }
}
/**
 * 归一化的坐标转为正常的以度为单位的经纬度坐标
 *
 * @param lng - 编码后的经度
 * @param lat - 编码后的纬度
 * @param ele - 编码后的高度
 * @param level - 网格级别
 * @param radius - 地球半径的近似值
 * @returns 一个包含经度、纬度和高度的对象
 */
export function unnormalize(lng: number, lat: number, ele: number, level: number) {
    const strip = 2 ** level;
    return {
        lng: (lng / strip) * 360 - 180,
        lat: (lat / strip) * 180 - 90,
        ele: (ele / strip * HEIGHT_EXTENT) - A,
    }
}
/**
 * 将经度、纬度和高度编码为一个二进制的三维编码
 *
 * @param lng - 经度，以度为单位。范围-180到180度
 * @param lat - 纬度，以度为单位。范围-90到90度
 * @param ele - 高度，以米为单位。海拔高度
 * @param level - 网格级别，决定网格的分辨率。
 * @param radius - 地球半径的近似值，默认为6378137米。
 * @returns 一个二进制的三维编码对象
 */
export function encodeBinary3D(lng: number, lat: number, ele: number, level: number,) {
    // const norm = normalize(lng, lat, ele, level)
    // const lngBits = BigInt(norm.lng);
    // const latBits = BigInt(norm.lat);
    // const eleBits = BigInt(norm.ele);
    const lngBits = BigInt(decimal2code(lng))
    const latBits = BigInt(decimal2code(lat))
    const D = ((ele + B) * 180) / (A * Math.PI)
    const eleBits = BigInt(decimal2code(D))

    return { lngBits, latBits, eleBits, level }
}
/**
 * 将一个二进制的三维编码解码回经度、纬度和高度
 *
 * @param binary3D - 一个二进制的三维编码对象
 * @returns 一个包含经度、纬度和高度的对象
 */
export function decodeBinary3D(binary3D: Binary3D) {
    const { lngBits, latBits, eleBits, level } = binary3D;
    // return unnormalize(Number(lngBits), Number(latBits), Number(eleBits), level)
    const lng = code2decimal(Number(lngBits))
    const lat = code2decimal(Number(latBits))
    const D = code2decimal(Number(eleBits))
    const H = D * A * (Math.PI / 180) - B
    return { lng, lat, ele: H }
}
/**
 * 将经度、纬度和高度编码为一个二进制的一维编码
 *
 * @param lng - 经度，以度为单位。范围-180到180度
 * @param lat - 纬度，以度为单位。范围-90到90度
 * @param ele - 高度，以米为单位。海拔高度
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
 * @param ele - 高度，以米为单位。海拔高度
 * @param level - 网格级别，决定网格的分辨率。
 * @param radius - 地球半径的近似值，默认为6378137米。
 * @returns 一个八进制的一维编码，包括经度、纬度和高度的八进制表示
 */
export function encodeOctal1D(lng: number, lat: number, ele: number, level: number,): Octal1D {
    const code3d = encodeBinary3D(lng, lat, ele, level);
    return binary3DToOctal1D(code3d);
}
/**
 * 二进制三维编码转为二进制一维编码 
 * @param binary3D 
 * @returns 二进制一维编码 ele+lat+lon
 */
export function binary3DToBinary1D(binary3D: Binary3D) {
    const { lngBits, latBits, eleBits, level } = binary3D;
    let binary1D = 0n;
    for (let i = 0n; i < 32n; i++) {
        let offset = 3n * i;
        binary1D |= ((lngBits >> i) & 1n) << offset;
        binary1D |= ((latBits >> i) & 1n) << (offset + 1n);
        binary1D |= ((eleBits >> i) & 1n) << (offset + 2n);
    }
    return { binary1D, level };
}
/**
 * 将一个二进制的一维编码解码回经度、纬度和高度的二进制表示
 *
 * @param binary1D - 一个二进制的一维编码对象
 * @returns 一个二进制的三维编码对象
 */
export function binary1DToBinary3D(binary1D: Binary1D): Binary3D {
    const { binary1D: code, level } = binary1D;
    let lngBits = 0n;
    let latBits = 0n;
    let eleBits = 0n;
    for (let i = 0n; i < 32n; i++) {
        let offset = 3n * i;
        lngBits |= ((code >> offset) & 1n) << i;
        latBits |= ((code >> (offset + 1n)) & 1n) << i;
        eleBits |= ((code >> (offset + 2n)) & 1n) << i;
    }
    return { lngBits, latBits, eleBits, level };
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
export function binary3DToOctal1D(binary3D: Binary3D) {
    const { binary1D, level } = binary3DToBinary1D(binary3D)
    let str = binary1D.toString(8);
    if (str.length < level) {
        str = str.padStart(level, "0")
    } else if (str.length > level) {
        str = str.substring(0, level)
    }
    return str;
}
/**
 * 将一个八进制的一维编码对象转换为二进制的三维编码对象
 *
 * @param octal1D - 一个八进制的一维编码对象
 * @returns 一个二进制的三维编码对象
 */
export function octal1DToBinary3D(octal1D: Octal1D): Binary3D {
    //@ts-ignore
    const strs = octal1D.replaceAll(/[G\-\.]/g, "");
    let lngBits = 0n;
    let latBits = 0n;
    let eleBits = 0n;
    let level = 0;
    for (let i = 0; i < strs.length; i++) {
        const code = parseInt(strs[i], 8);
        lngBits = (lngBits << 1n) | BigInt(code & 1);
        latBits = (latBits << 1n) | BigInt((code >> 1) & 1);
        eleBits = (eleBits << 1n) | BigInt((code >> 2) & 1);
        level++;
    }
    return { lngBits, latBits, eleBits, level };
}