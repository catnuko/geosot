import { test, expect } from "vitest"
import * as geos from "../src";
const { geosot, geosot3d, utils } = geos
test("geosot3d.encode.decode", () => {
    const v = geosot3d.encode3d(1234n, 1234n, 1234n, 15)
    const res = geosot3d.decode3d(v);
    expect(res.latBits).toBe(1234n)
    expect(res.lngBits).toBe(1234n)
    expect(res.eleBits).toBe(1234n)
    expect(res.level).toBe(15)
})
test("geosot3d.changeCode", () => {
    const ps = [
        [116.315228, 39.91028, 100.123456789],
        [-116.315228, -39.91028, -100.123456789],
        [116.315228, -39.91028, 100.123456789],
        [-116.315228, 39.91028, 100.123456789],
        [116.315228, 39.91028, -100.123456789],
    ]
    for (let p of ps) {
        const binary3D = geosot3d.encodeBinary3D(p[0], p[1], p[2], 32)
        const binary1D = geosot3d.binary3DToBinary1D(binary3D)
        const octal1D = geosot3d.binary3DToOctal1D(binary3D)
        expect(geosot3d.octal1DToBinary3D(octal1D)).toStrictEqual(binary3D);
        expect(geosot3d.binary1DToBinary3D(binary1D)).toStrictEqual(binary3D);

        const corner = geosot3d.decodeBinary3D(geosot3d.binary1DToBinary3D(binary1D));
        expect(corner.lng).toBeCloseTo(p[0], 6)
        expect(corner.lat).toBeCloseTo(p[1], 6)
        expect(Math.abs(corner.ele - p[2])).toBeLessThan(1.5)
    }
})

test("geosot3d.elevation", () => {
    const lat = 39.91028;
    const lng = 116.315228;
    let dif1, dif2
    {
        const res1 = geosot3d.decodeOctal1D(geosot3d.encodeOctal1D(lng, lat, 100, 26))
        const res2 = geosot3d.decodeOctal1D(geosot3d.encodeOctal1D(lng, lat, 101, 26))
        dif1 = res2.ele - res1.ele;
    }
    {
        const res1 = geosot3d.decodeOctal1D(geosot3d.encodeOctal1D(lng, lat, 10000, 26))
        const res2 = geosot3d.decodeOctal1D(geosot3d.encodeOctal1D(lng, lat, 10001, 26))
        dif2 = res2.ele - res1.ele;
    }
    expect(dif1 - dif2).toBeCloseTo(0, 1);
})

test("geosot3d.move", () => {
    const lat = 39.91028;
    const lng = 116.315228;
    const ele = 100;
    const level = 26;
    const size = geosot3d.getSize(level);
    const sizeInMeter = geosot3d.getSizeInMeters(level);
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.encodeBinary3D(lng, lat, ele, level), "lng", 1));
        expect(octal1D === geosot3d.encodeOctal1D(lng + size, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng + size * 2, lat, ele, level)).toBe(true)
    }
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.encodeBinary3D(lng, lat, ele, level), "lat", 1));
        expect(octal1D === geosot3d.encodeOctal1D(lng, lat + size, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat + size * 2, ele, level)).toBe(true)
    }
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.encodeBinary3D(lng, lat, ele, level), "ele", 1));
        expect(octal1D === geosot3d.encodeOctal1D(lng, lat, ele + sizeInMeter, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele + sizeInMeter * 2, level)).toBe(true)
    }

    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.encodeBinary3D(lng, lat, ele, level), "lng", -1));
        expect(octal1D === geosot3d.encodeOctal1D(lng - size, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng - size * 2, lat, ele, level)).toBe(true)
    }
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.encodeBinary3D(lng, lat, ele, level), "lat", -1));
        expect(octal1D === geosot3d.encodeOctal1D(lng, lat - size, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat - size * 2, ele, level)).toBe(true)
    }
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.encodeBinary3D(lng, lat, ele, level), "ele", -1));
        expect(octal1D === geosot3d.encodeOctal1D(lng, lat, ele - sizeInMeter, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele - sizeInMeter * 2, level)).toBe(true)
    }

    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.encodeBinary3D(lng, lat, ele, level), "ele", 2));
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele + sizeInMeter, level)).toBe(true)
        expect(octal1D !== geosot3d.encodeOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D === geosot3d.encodeOctal1D(lng, lat, ele + sizeInMeter * 2, level)).toBe(true)
    }

    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.add(geosot3d.encodeBinary3D(lng, lat, ele, level), { x: 1, y: 1, z: 1 }));
        expect(octal1D === geosot3d.encodeOctal1D(lng + size, lat + size, ele + sizeInMeter, level)).toBe(true)
    }

    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.add(geosot3d.encodeBinary3D(lng, lat, ele, level), { x: -1, y: -1, z: -1 }));
        expect(octal1D === geosot3d.encodeOctal1D(lng - size, lat - size, ele - sizeInMeter, level)).toBe(true)
    }

    {
        const b = geosot3d.encodeBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: 1, y: 1, z: 1 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: 1, y: 1, z: 1 })
    }
    {
        const b = geosot3d.encodeBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: 3, y: 3, z: 3 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: 3, y: 3, z: 3 })
    }
    {
        const b = geosot3d.encodeBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: 1, y: 2, z: 3 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: 1, y: 2, z: 3 })
    }

    {
        const b = geosot3d.encodeBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: 0, y: 0, z: 0 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: 0, y: 0, z: 0 })
    }

    {
        const b = geosot3d.encodeBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: -1, y: -1, z: -1 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: -1, y: -1, z: -1 })
    }
    {
        const b = geosot3d.encodeBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: -3, y: -2, z: -1 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: -3, y: -2, z: -1 })
    }
})
//0xFFFFFFFFn