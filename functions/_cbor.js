// CBOR 解析安全上限（防止恶意/畸形输入导致 Worker 高 CPU/内存）
const CBOR_MAX_BYTES = 64 * 1024; // 64KB，WebAuthn 实际报文远小于此
const CBOR_MAX_DEPTH = 32;

// CBOR 解码器 — WebAuthn 子集实现
// 只支持 WebAuthn 用到的类型：uint/negint/bytes/text/array/map/tag/simple
// 参考 RFC 8949
//
// 用途：解析 attestationObject / COSE public key

export function decodeCbor(input) {
  if (!input || typeof input.length !== 'number' || input.length > CBOR_MAX_BYTES) {
    throw new Error('cbor_too_large');
  }
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let pos = 0;

  function readByte() {
    if (pos >= bytes.length) throw new Error('cbor_eof');
    return bytes[pos++];
  }

  function readBytes(n) {
    if (pos + n > bytes.length) throw new Error('cbor_eof');
    const out = bytes.slice(pos, pos + n);
    pos += n;
    return out;
  }

  function readLength(ai) {
    if (ai < 24) return ai;
    if (ai === 24) return readByte();
    if (ai === 25) return (readByte() << 8) | readByte();
    if (ai === 26) {
      let v = 0;
      for (let i = 0; i < 4; i += 1) v = v * 256 + readByte();
      if (v > CBOR_MAX_BYTES) throw new Error('cbor_len_exceeds_max');
      return v;
    }
    if (ai === 27) {
      let v = 0;
      for (let i = 0; i < 8; i += 1) v = v * 256 + readByte();
      if (v > CBOR_MAX_BYTES) throw new Error('cbor_len_exceeds_max');
      return v;
    }
    throw new Error('cbor_invalid_length_ai_' + ai);
  }

  function decode(depth) {
    depth = depth || 0;
    if (depth > CBOR_MAX_DEPTH) throw new Error('cbor_too_deep');
    const b = readByte();
    const major = b >> 5;
    const info = b & 0x1f;

    if (major === 0) return readLength(info);
    if (major === 1) return -1 - readLength(info);

    if (major === 2) {
      const len = readLength(info);
      return readBytes(len);
    }

    if (major === 3) {
      const len = readLength(info);
      const raw = readBytes(len);
      return new TextDecoder().decode(raw);
    }

    if (major === 4) {
      const len = readLength(info);
      const arr = new Array(len);
      for (let i = 0; i < len; i += 1) arr[i] = decode(depth + 1);
      return arr;
    }

    if (major === 5) {
      const len = readLength(info);
      const obj = {};
      for (let i = 0; i < len; i += 1) {
        const k = decode(depth + 1);
        const v = decode(depth + 1);
        obj[String(k)] = v;
      }
      return obj;
    }

    if (major === 6) {
      readLength(info);
      return decode(depth + 1);
    }

    if (major === 7) {
      if (info === 20) return false;
      if (info === 21) return true;
      if (info === 22) return null;
      if (info === 23) return undefined;
      // 浮点数忽略（WebAuthn 不用）
      if (info === 25) { readBytes(2); return 0; }
      if (info === 26) { readBytes(4); return 0; }
      if (info === 27) { readBytes(8); return 0; }
      throw new Error('cbor_invalid_simple_' + info);
    }

    throw new Error('cbor_invalid_major_' + major);
  }

  const result = decode(0);
  if (pos !== bytes.length) {
    // 允许尾部有多余字节（某些实现会追加）
  }
  return result;
}
