const masks = [0x00000000ffffffffn, 0x0000ffff0000ffffn, 0x00ff00ff00ff00ffn, 0x0f0f0f0f0f0f0f0fn, 0x3333333333333333n, 0x5555555555555555n];

export function splitBy2Bits(x: bigint) {
    x = (x | (x << 32n)) & masks[0];
    x = (x | (x << 16n)) & masks[1];
    x = (x | (x << 8n)) & masks[2];
    x = (x | (x << 4n)) & masks[3];
    x = (x | (x << 2n)) & masks[4];
    x = (x | (x << 1n)) & masks[5];
    return x;
}
export function getSecondBits(m: bigint) {
    let x = m & masks[5];
    x = (x ^ (x >> 1n)) & masks[4];
    x = (x ^ (x >> 2n)) & masks[3];
    x = (x ^ (x >> 4n)) & masks[2];
    x = (x ^ (x >> 8n)) & masks[1];
    x = (x ^ (x >> 16n)) & masks[0];
    return x;
}

export function magicbits(l: bigint, b: bigint) {
    return splitBy2Bits(l) | (splitBy2Bits(b) << 1n);
}

export function inverseMagicbits(id: bigint) {
    const l = Number(getSecondBits(id));
    const b = Number(getSecondBits(id >> 1n));
    return { l, b };
}
