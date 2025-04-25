# geosot

主要从[dadream/geosot](https://github.com/dadream/geosot)翻译

[![npm version](https://badgen.net/npm/v/geosot)](https://npm.im/geosot) [![npm downloads](https://badgen.net/npm/dm/geosot)](https://npm.im/geosot)

## Using this template

Features:

- 经纬度转二进制编码
- 经纬度转四进制编码
- 获取经纬度所在的行列号XY
- 经纬度转所在瓦片的角点
- 经纬度转所在瓦片的bbox


## Install

```bash
npm i geosot
```

## Usage

```typescript
import * as geosot from 'geosot'
import sexagesimal from '@mapbox/sexagesimal'
const [lat, lng] = sexagesimal.pair("39° 54′ 37.0″ N, 116° 18′ 54.8″ E");
const compare = (level: number, expectValue: string) => {
    const corner = geosot.cornerFromLngLat(lng, lat, level);
    const v = sexagesimal.pair(expectValue);
    expect(corner.lat).toBe(geosot.round(v[0], 6));
    expect(corner.lng).toBe(geosot.round(v[1], 6));
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
```

## Sponsors

[![sponsors](https://sponsors-images.egoist.dev/sponsors.svg)](https://github.com/sponsors/egoist)

## License

MIT &copy; [EGOIST](https://github.com/sponsors/egoist)
