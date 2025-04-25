import { test, expect } from "vitest"
import * as morton from "../src/morton";
import * as geos from "../src";
import sexagesimal from '@mapbox/sexagesimal'
const { geosot, geosot3d, utils } = geos
test("morton", () => {
  expect(morton.splitBy2Bits(639358566)).toBe(293861272910566420n)
})
test("encode2string", () => {
  {
    let x = 76.233;
    let y = 27.688;
    let level = 32;
    expect(geosot.encode2number(x, y, level)).toBe(339638376531246140n)
    expect(geosot.encode2string(x, y, level)).toBe("G001023122-203103-131010.33003300330")
  }

  {
    const lat = 39.91028;
    const lng = 116.315228;
    expect(geosot.encode2string(lng, lat, 15)).toBe("G001310322-230230");
  }

  const [lat, lng] = sexagesimal.pair("39° 54′ 37.0″ N, 116° 18′ 54.8″ E");
  const compare = (level: number, expectValue: string) => {
    const corner = geosot.cornerFromLngLat(lng, lat, level);
    const v = sexagesimal.pair(expectValue);
    expect(utils.round(corner.lat, 6)).toBe(utils.round(v[0], 6));
    expect(utils.round(corner.lng, 6)).toBe(utils.round(v[1], 6));
  }
  compare(7, "36° N, 116° E")
  compare(8, "38° N, 116° E")
  compare(9, "39° N, 116° E")
  compare(14, "39° 54′ N, 116° 18′ E")
  compare(15, "39° 54′ N, 116° 18′ E")
  compare(20, "39° 54′ 36″ N, 116° 18′ 54″ E")
  compare(21, "39° 54′ 37″ N, 116° 18′ 54″ E")
  compare(22, "39° 54′ 37.0″ N, 116° 18′ 54.5″ E")
  compare(23, "39° 54′ 37.0″ N, 116° 18′ 54.75″ E")
  compare(24, "39° 54′ 37.0″ N, 116° 18′ 54.75″ E")
  compare(25, "39° 54′ 37.0″ N, 116° 18′ 54.75″ E")
  compare(26, "39° 54′ 37.0″ N, 116° 18′ 54.78125″ E")
  compare(27, "39° 54′ 37.0″ N, 116° 18′ 54.796875″ E")
  compare(28, "39° 54′ 37.0″ N, 116° 18′ 54.796875″ E")
  compare(29, "39° 54′ 37.0″ N, 116° 18′ 54.796875″ E")
  compare(30, "39° 54′ 37.0″ N, 116° 18′ 54.798828125″ E")
  compare(31, "39° 54′ 37.0″ N, 116° 18′ 54.7998046875″ E")
  compare(32, "39° 54′ 37.0″ N, 116° 18′ 54.7998046875″ E")
});
test("toCode", () => {
  {
    const code = "G001310322-230230"
    const res = geosot.toId(code)
    expect(geosot.toCode(res.id, res.level)).toBe(code);
  }
  {
    const code = "G001023122-203103-131010.33003300330"
    const res = geosot.toId(code)
    expect(geosot.toCode(res.id, res.level)).toBe(code);
  }
})

test("xy", () => {
  const lat = 39.91028;
  const lng = 116.315228;
  expect(geosot.xyFromLngLat(lng, lat, 15)).toStrictEqual({ x: 7442, y: 2550 })
})

test("corner", () => {
  const lat = 39.91028;
  const lng = 116.315228;
  expect(geosot.cornerFromLngLat(lng, lat, 15)).toStrictEqual({ lng: 116.3, lat: 39.9 });
  expect(geosot.cornerFromCode("G001310322 - 230230")).toStrictEqual({ lng: 116.3, lat: 39.9 });
})

test("bbox", () => {
  const lat = 39.91028;
  const lng = 116.315228;
  expect(geosot.bboxFromLngLat(lng, lat, 15)).toStrictEqual({ west: 116.3, south: 39.9, east: 116.316667, north: 39.916667 })
})


test("elevation", () => {
  expect(geosot.encodeElevation(900, 16)).toBe("0000000000000000")
  expect(geosot.encodeElevation(990, 16)).toBe("0000000000000001")
  expect(geosot.encodeElevation(-900, 16)).toBe("1000000000000001")
  expect(geosot.encodeElevation(-990, 16)).toBe("1000000000000010")

  expect(geosot.decodeElevation("0000000000000000")).toBe(0);
  expect(utils.round(geosot.decodeElevation("0000000000000001"), 2)).toBe(981.05);
})

test("geosot3d.changeCode", () => {
  const ps = [
    [116.315228, 39.91028, 100.123456789],
    [-116.315228, -39.91028, -100.123456789],
    [116.315228, -39.91028, 100.123456789],
    [-116.315228, 39.91028, 100.123456789],
    [116.315228, 39.91028, -100.123456789],
  ]
  // for (let p of ps) {
  //   for (let i = 1; i <= 32; i++) {
  //     const binary3D = geosot3d.encodeBinary3D(p[0], p[1], p[2], i)
  //     const binary1D = geosot3d.binary3DToBinary1D(binary3D)
  //     const octal1D = geosot3d.binary3DToOctal1D(binary3D)
  //     expect(geosot3d.octal1DToBinary3D(octal1D)).toStrictEqual(binary3D);
  //     expect(geosot3d.binary1DToBinary3D(binary1D)).toStrictEqual(binary3D);
  //   }
  // }
  const p = ps[0]
  const binary3D = geosot3d.encodeBinary3D(p[0], p[1], p[2], 10)
  const binary1D = geosot3d.binary3DToBinary1D(binary3D)
  const octal1D = geosot3d.binary3DToOctal1D(binary3D)
  expect(geosot3d.octal1DToBinary3D(octal1D)).toStrictEqual(binary3D);
  expect(geosot3d.binary1DToBinary3D(binary1D)).toStrictEqual(binary3D);
})