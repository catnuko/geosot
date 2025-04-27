import { test, expect } from "vitest"
import * as morton from "../src/morton";
import * as geos from "../src";
import sexagesimal from '@mapbox/sexagesimal'
const { geosot, geosot3d, utils } = geos

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

