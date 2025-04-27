/**
 * # GeoSOT-3D 算法来自猜测
 * GeoSOT-3D是在标准GBT+40087-2021规定的GeoSOT的基础上拓展出的，兼容GeoSOT的二维网格部分，
 * 但高度剖分规则和GeosOT中的不一样，GeoSOT为了使低海拔和高海拔的网格大小看起来都是正方体，采用了
 * 不等距的剖分规则，也就是同一级别中，低海拔的格子的高度和高海拔的高度不一样。GeoSOT-3D为了简化
 * 高度剖分规则，用的等距剖分规则。
 * 
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
 */

import { A, B, code2decimal, decimal2code } from "./utils";

export type Binary3D = {
    lngBits: bigint, latBits: bigint, eleBits: bigint, level: number
}
export type Binary1D = {
    binary1D: bigint,
    level: number
}
export type Octal1D = string;
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
    const lngBits = BigInt(decimal2code(lng))
    const latBits = BigInt(decimal2code(lat))
    const D = ((ele + B) * 180) / (A * Math.PI)//海拔转为度
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
    const { lngBits, latBits, eleBits } = binary3D;
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
 * 将一个二进制的一维编码解码回经度、纬度和高度
 *
 * @param binary1D - 一个二进制的一维编码对象
 * @returns 一个包含经度、纬度和高度的对象
 */
export function decodeBinary1D(binary1D: Binary1D) {
    const binary3D = binary1DToBinary3D(binary1D)
    return decodeBinary3D(binary3D);
}
/**
 * 将一个八进制的一维编码解码回经度、纬度和高度
 *
 * @param octal1D - 一个八进制的一维编码对象
 * @returns 一个包含经度、纬度和高度的对象
 */

export function decodeOctal1D(octal1D: Octal1D) {
    const binary3D = octal1DToBinary3D(octal1D)
    return decodeBinary3D(binary3D);
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
    const binary1D = binary3DToBinary1D(binary3D)
    return binary1DToOctal1D(binary1D)
}

export function binary1DToOctal1D(code: Binary1D): Octal1D {
    const { binary1D, level } = code;
    let str = binary1D.toString(8);//八进制一维码和二进制一维码完全对应
    return str.padStart(32, "0").substring(0, level)
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
    const level = strs.length;
    for (let i = 31n; i > 0n; i--) {
        let str = strs[Number(31n - i)]
        if (!str) continue
        const code = BigInt(parseInt(str, 8))
        lngBits |= (code & 1n) << i;
        latBits |= ((code >> 1n) & 1n) << i;
        eleBits |= ((code >> 2n) & 1n) << i;
    }
    return { lngBits, latBits, eleBits, level };
}

export function octal1DToBinary1D(octal1D: Octal1D): Binary1D {
    //@ts-ignore
    const strs = octal1D.replaceAll(/[G\-\.]/g, "");
    const level = strs.length;
    const binary1D = BigInt(strs)
    return { binary1D, level }
}

export const parent = parentByOctal1D;
/**
 * 获取一个八进制的一维编码对象的父级
 *
 * @param octal1D - 一个八进制的一维编码对象
 * @returns 一个八进制的一维编码对象的父级
 */

export function parentByOctal1D(octal1D: Octal1D) {
    const level = octal1D.length;
    return octal1D.substring(0, level - 1)
}

/**
 * 获取一个二进制的一维编码对象的父级
 *
 * @param binary1D - 一个二进制的一维编码对象
 * @returns 一个二进制的一维编码对象的父级
 */

export function parentByBinary1D(binary1D: Binary1D) {
    return parent(binary1DToOctal1D(binary1D))
}
