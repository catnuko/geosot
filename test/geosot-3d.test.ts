import { test, expect } from "vitest"
import * as geos from "../src";
const { geosot, geosot3d, utils } = geos
test("geosto3d.basic", () => {
    const level = 23;
    const p1 = [120, 30, 10, level]
    const octal1D = geosot3d.locToOctal1D(p1[0], p1[1], p1[2], p1[3])
    expect(geosot3d.octal1DToBinary1D(octal1D)).toBe(geosot3d.locToBinary1D(p1[0], p1[1], p1[2], p1[3]))
    expect(geosot3d.octal1DToBinary3D(octal1D)).toBe(geosot3d.locToBinary3D(p1[0], p1[1], p1[2], p1[3]))

    expect(geosot3d.binary1DToOctal1D(geosot3d.octal1DToBinary1D(octal1D))).toBe(octal1D)
    expect(geosot3d.binary3DToOctal1D(geosot3d.octal1DToBinary3D(octal1D))).toBe(octal1D)

    expect(geosot3d.binary1DToBinary3D(geosot3d.locToBinary1D(p1[0], p1[1], p1[2], p1[3]))).toBe(geosot3d.locToBinary3D(p1[0], p1[1], p1[2], p1[3]))
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
        const binary3D = geosot3d.locToBinary3D(p[0], p[1], p[2], 32)
        const binary1D = geosot3d.binary3DToBinary1D(binary3D)
        const octal1D = geosot3d.binary3DToOctal1D(binary3D)
        expect(geosot3d.octal1DToBinary3D(octal1D)).toStrictEqual(binary3D);
        expect(geosot3d.binary1DToBinary3D(binary1D)).toStrictEqual(binary3D);

        const corner = geosot3d.binary3dToLoc(geosot3d.binary1DToBinary3D(binary1D));
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
        const res1 = geosot3d.octal1DToLoc(geosot3d.locToOctal1D(lng, lat, 100, 26))
        const res2 = geosot3d.octal1DToLoc(geosot3d.locToOctal1D(lng, lat, 101, 26))
        dif1 = res2.ele - res1.ele;
    }
    {
        const res1 = geosot3d.octal1DToLoc(geosot3d.locToOctal1D(lng, lat, 10000, 26))
        const res2 = geosot3d.octal1DToLoc(geosot3d.locToOctal1D(lng, lat, 10001, 26))
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
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.locToBinary3D(lng, lat, ele, level), "lng", 1));
        expect(octal1D === geosot3d.locToOctal1D(lng + size, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng + size * 2, lat, ele, level)).toBe(true)
    }
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.locToBinary3D(lng, lat, ele, level), "lat", 50));
        expect(octal1D === geosot3d.locToOctal1D(lng, lat + size * 50, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat + size * 2, ele, level)).toBe(true)
    }
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.locToBinary3D(lng, lat, ele, level), "ele", 1));
        expect(octal1D === geosot3d.locToOctal1D(lng, lat, ele + sizeInMeter, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele + sizeInMeter * 2, level)).toBe(true)
    }

    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.locToBinary3D(lng, lat, ele, level), "lng", -1));
        expect(octal1D === geosot3d.locToOctal1D(lng - size, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng - size * 2, lat, ele, level)).toBe(true)
    }
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.locToBinary3D(lng, lat, ele, level), "lat", -1));
        expect(octal1D === geosot3d.locToOctal1D(lng, lat - size, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat - size * 2, ele, level)).toBe(true)
    }
    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.locToBinary3D(lng, lat, ele, level), "ele", -1));
        expect(octal1D === geosot3d.locToOctal1D(lng, lat, ele - sizeInMeter, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele - sizeInMeter * 2, level)).toBe(true)
    }

    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.moveBinary3D(geosot3d.locToBinary3D(lng, lat, ele, level), "ele", 6));
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele + sizeInMeter, level)).toBe(true)
        expect(octal1D !== geosot3d.locToOctal1D(lng, lat, ele, level)).toBe(true)
        expect(octal1D === geosot3d.locToOctal1D(lng, lat, ele + sizeInMeter * 6, level)).toBe(true)
    }

    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.add(geosot3d.locToBinary3D(lng, lat, ele, level), { x: 1, y: 1, z: 1 }));
        expect(octal1D === geosot3d.locToOctal1D(lng + size, lat + size, ele + sizeInMeter, level)).toBe(true)
    }

    {
        const octal1D = geosot3d.binary3DToOctal1D(geosot3d.add(geosot3d.locToBinary3D(lng, lat, ele, level), { x: -1, y: -1, z: -1 }));
        expect(octal1D === geosot3d.locToOctal1D(lng - size, lat - size, ele - sizeInMeter, level)).toBe(true)
    }

    {
        const b = geosot3d.locToBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: 1, y: 1, z: 1 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: 1, y: 1, z: 1 })
    }
    {
        const b = geosot3d.locToBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: 3, y: 3, z: 3 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: 3, y: 3, z: 3 })
    }
    {
        const b = geosot3d.locToBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: 1, y: 2, z: 3 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: 1, y: 2, z: 3 })
    }

    {
        const b = geosot3d.locToBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: 0, y: 0, z: 0 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: 0, y: 0, z: 0 })
    }

    {
        const b = geosot3d.locToBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: -1, y: -1, z: -1 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: -1, y: -1, z: -1 })
    }
    {
        const b = geosot3d.locToBinary3D(lng, lat, ele, level);
        const a = geosot3d.add(b, { x: -3, y: -2, z: -1 });
        expect(geosot3d.sub(a, b)).toStrictEqual({ x: -3, y: -2, z: -1 })
    }
    {
        const binary3D = geosot3d.locToBinary3D(lng, lat, ele, level);

        const binary3DAdded = geosot3d.add(binary3D, { x: 10, y: 20, z: 30 })
        let code3d = binary3D
        code3d = geosot3d.moveBinary3D(code3d, "lng", 10)
        code3d = geosot3d.moveBinary3D(code3d, "lat", 20)
        code3d = geosot3d.moveBinary3D(code3d, "ele", 30)

        let code3d2 = binary3D
        code3d2 = geosot3d.moveBinary3D(code3d2, "lat", 20)
        code3d2 = geosot3d.moveBinary3D(code3d2, "lng", 10)
        code3d2 = geosot3d.moveBinary3D(code3d2, "ele", 30)
        expect(code3d).toBe(binary3DAdded)
        expect(code3d2).toBe(binary3DAdded)

        const realCode1d = geosot3d.locToBinary3D(lng + size * 10, lat + size * 20, ele + sizeInMeter * 30, level);
        expect(binary3DAdded).toBe(realCode1d)
    }
})
test("geosot3d.addsub", () => {
    {
        const level = 23;
        const surfaceElevation = geosot3d.getSurfaceElevation(level)
        const p1 = [120, 30, surfaceElevation + 10, level]
        const swb = geosot3d.locToBinary3D(p1[0], p1[1], p1[2], p1[3])
        const p2 = [121, 31, surfaceElevation + 50, level]
        const net = geosot3d.locToBinary3D(p2[0], p2[1], p2[2], p2[3])

        const netAdded = geosot3d.add(swb, geosot3d.sub(net, swb))

        expect(geosot3d.decodeLevel(swb)).toBe(BigInt(level))
        expect(geosot3d.decodeLevel(net)).toBe(BigInt(level))
        expect(geosot3d.decodeLevel(netAdded)).toBe(BigInt(level))

        expect(netAdded).toBe(net)
    }
    {
        const level = 23;
        const p1 = [114.4954767923592, 30.555055530562935, 10.000000072900132, level]
        const swb = geosot3d.locToBinary3D(p1[0], p1[1], p1[2], p1[3])
        const p2 = [114.49898306349338, 30.557538512650936, 50.003707119878726, level]
        const net = geosot3d.locToBinary3D(p2[0], p2[1], p2[2], p2[3])

        const size = geosot3d.getSize(level)
        const sizeInMeter = geosot3d.getSizeInMeters(level)
        const xc = Math.ceil((p2[0] - p1[0]) / size)
        const yc = Math.ceil((p2[1] - p1[1]) / size)
        const zc = Math.floor((p2[2] - p1[2]) / sizeInMeter)

        const offset = { x: xc, y: yc, z: zc }
        const netAdded = geosot3d.add(swb, offset)
        expect(geosot3d.sub(netAdded, swb)).toStrictEqual(offset)
        expect(netAdded).toBe(net)
    }
})