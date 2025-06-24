  class TextEncoder {
    encode(str) {
      // 将字符串转换为UTF-8字节数组
      const utf8 = [];
      for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
          utf8.push(charCode);
        } else if (charCode < 0x800) {
          utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
        } else if (charCode < 0xd800 || charCode >= 0xe000) {
          utf8.push(
            0xe0 | (charCode >> 12),
            0x80 | ((charCode >> 6) & 0x3f),
            0x80 | (charCode & 0x3f)
          );
        } else {
          // 处理代理对（surrogate pair）
          i++;
          charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
          utf8.push(
            0xf0 | (charCode >> 18),
            0x80 | ((charCode >> 12) & 0x3f),
            0x80 | ((charCode >> 6) & 0x3f),
            0x80 | (charCode & 0x3f)
          );
        }
      }
      return new Uint8Array(utf8);
    }
  }

  function packNumberAs4Bytes(n) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, n);
    return new Uint8Array(view.buffer);
  }

  function dataViewToString(view, offset = 0, length = view.byteLength) {
    let res = '';
    const maxLength = Math.min(length, view.byteLength - offset);
    for (let i = 0; i < maxLength; i += 1) {
      res += String.fromCharCode(view.getUint8(offset + i));
    }
    return res;
  }

  function encodeString(s) {
    return new TextEncoder().encode(s);
  }

  function concatArrays(arrays) {
    const length = arrays.reduce((prev, array) => prev + array.byteLength, 0);
    const finalArray = new Uint8Array(length);
    for (let i = 0, lenSoFar = 0; i < arrays.length; i += 1) {
      finalArray.set(arrays[i], lenSoFar);
      lenSoFar += arrays[i].byteLength;
    }
    return finalArray;
  }

  function getDataView(array) {
    return new DataView(array.buffer, array.byteOffset, array.byteLength);
  }

  function isPNG(array) {
    const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    if (array.length < pngSignature.length) {
      return false;
    }
    return getDataView(pngSignature).getBigUint64() === getDataView(array).getBigUint64();
  }

  const crcTable = [];

  function crc(data) {
    /* eslint-disable no-plusplus */
    /* eslint-disable no-bitwise */
    // Pre-compute CRC table
    if (crcTable.length === 0) {
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
          if (c & 1) {
            c = 0xedb88320 ^ (c >>> 1);
          } else {
            c >>>= 1;
          }
        }
        crcTable[n] = c;
      }
    }
    const initialCrc = 0xffffffff;
    const updateCrc = (currentCrc, d, length) => {
      let c = currentCrc;
      for (let n = 0; n < length; n++) {
        c = crcTable[(c ^ d[n]) & 0xff] ^ (c >>> 8);
      }
      return c;
    };
    return (updateCrc(initialCrc, data, data.byteLength) ^ initialCrc) >>> 0;
  }

  export function addMetadata(PNGUint8Array, key, value) {
    console.log(111111)
    if (!isPNG(PNGUint8Array)) {
      console.log('不是png');
    }

    console.log(222)

    if (key.length < 1 || key.length > 79) {
      console.log('key长度不对');
    }

    // Prepare tEXt chunk to insert
    const chunkType = encodeString('tEXt');
    const chunkData = encodeString(`${key}\0${value}`);
    const chunkCRC = packNumberAs4Bytes(crc(concatArrays([chunkType, chunkData])));
    const chunkDataLen = packNumberAs4Bytes(chunkData.byteLength);
    const chunk = concatArrays([chunkDataLen, chunkType, chunkData, chunkCRC]);

    // Compute header (IHDR) length
    const headerDataLenOffset = 8;
    const headerDataLen = getDataView(PNGUint8Array).getUint32(headerDataLenOffset);
    const headerLen = 8 + 4 + 4 + headerDataLen + 4;

    // Assemble new PNG
    const head = PNGUint8Array.subarray(0, headerLen);
    const tail = PNGUint8Array.subarray(headerLen);
    return concatArrays([head, chunk, tail]);
  }

  export function addMetadataFromBase64DataURI(dataURI, key, value) {
    const prefix = 'data:image/png;base64,';
    if (typeof dataURI !== 'string' || dataURI.substring(0, prefix.length) !== prefix) {
      throw new TypeError('Invalid PNG as Base64 Data URI');
    }
    const dataStr = atob(dataURI.substring(prefix.length));
    const PNGUint8Array = new Uint8Array(dataStr.length);
    for (let i = 0; i < dataStr.length; i += 1) {
      PNGUint8Array[i] = dataStr.charCodeAt(i);
    }
    const newPNGUint8Array = addMetadata(PNGUint8Array, key, value);
    return prefix + btoa(dataViewToString(getDataView(newPNGUint8Array)));
  }

  export function getMetadata(PNGUint8Array, key) {
    if (!isPNG(PNGUint8Array)) {
      throw new TypeError('Invalid PNG');
    }

    const view = getDataView(PNGUint8Array);
    let offset = 8;
    while (offset < view.byteLength) {
      const chunkLength = view.getUint32(offset);
      if (dataViewToString(view, offset + 4, 4 + key.length) === `tEXt${key}`) {
        return dataViewToString(view, offset + 4 + 4 + key.length + 1, chunkLength - key.length - 1);
      }
      offset += chunkLength + 12; // skip 4 bytes of chunkLength, 4 of chunkType, 4 of CRC
    }
    return undefined;
  }