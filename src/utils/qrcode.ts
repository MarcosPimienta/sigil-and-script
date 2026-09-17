// ─────────────────────────────────────────────────────────────────────────────
// Zero-Dependency QR Code Generator (ISO/IEC 18004)
// Generates 2D boolean matrix, clean SVG vector paths, and draws to Canvas.
// ─────────────────────────────────────────────────────────────────────────────

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrRenderOptions {
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  ecLevel?: QrErrorCorrectionLevel;
}

// Galois Field GF(256) with primitive polynomial 0x11d (285)
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsComputePoly(ecCount: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < ecCount; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = GF256_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = rsComputePoly(ecCount);
  const remainder = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      remainder[j] ^= gfMul(gen[j], factor);
    }
  }
  return remainder;
}

// Table of QR code versions data capacity & block structure (Versions 1 to 10)
// Format: [version, ecLevel(0:L,1:M,2:Q,3:H), totalCodewords, dataCodewords, ecCodewords, numBlocksGroup1, dataPerBlockG1, numBlocksGroup2, dataPerBlockG2]
const QR_VERSION_SPECS: Record<number, Record<QrErrorCorrectionLevel, { totalData: number; ecPerBlock: number; blocksG1: number; dataG1: number; blocksG2: number; dataG2: number }>> = {
  1: {
    L: { totalData: 19, ecPerBlock: 7, blocksG1: 1, dataG1: 19, blocksG2: 0, dataG2: 0 },
    M: { totalData: 16, ecPerBlock: 10, blocksG1: 1, dataG1: 16, blocksG2: 0, dataG2: 0 },
    Q: { totalData: 13, ecPerBlock: 13, blocksG1: 1, dataG1: 13, blocksG2: 0, dataG2: 0 },
    H: { totalData: 9, ecPerBlock: 17, blocksG1: 1, dataG1: 9, blocksG2: 0, dataG2: 0 },
  },
  2: {
    L: { totalData: 34, ecPerBlock: 10, blocksG1: 1, dataG1: 34, blocksG2: 0, dataG2: 0 },
    M: { totalData: 28, ecPerBlock: 16, blocksG1: 1, dataG1: 28, blocksG2: 0, dataG2: 0 },
    Q: { totalData: 22, ecPerBlock: 22, blocksG1: 1, dataG1: 22, blocksG2: 0, dataG2: 0 },
    H: { totalData: 16, ecPerBlock: 28, blocksG1: 1, dataG1: 16, blocksG2: 0, dataG2: 0 },
  },
  3: {
    L: { totalData: 55, ecPerBlock: 15, blocksG1: 1, dataG1: 55, blocksG2: 0, dataG2: 0 },
    M: { totalData: 44, ecPerBlock: 26, blocksG1: 1, dataG1: 44, blocksG2: 0, dataG2: 0 },
    Q: { totalData: 34, ecPerBlock: 18, blocksG1: 2, dataG1: 17, blocksG2: 0, dataG2: 0 },
    H: { totalData: 26, ecPerBlock: 22, blocksG1: 2, dataG1: 13, blocksG2: 0, dataG2: 0 },
  },
  4: {
    L: { totalData: 80, ecPerBlock: 20, blocksG1: 1, dataG1: 80, blocksG2: 0, dataG2: 0 },
    M: { totalData: 64, ecPerBlock: 18, blocksG1: 2, dataG1: 32, blocksG2: 0, dataG2: 0 },
    Q: { totalData: 48, ecPerBlock: 26, blocksG1: 2, dataG1: 24, blocksG2: 0, dataG2: 0 },
    H: { totalData: 36, ecPerBlock: 16, blocksG1: 4, dataG1: 9, blocksG2: 0, dataG2: 0 },
  },
  5: {
    L: { totalData: 108, ecPerBlock: 26, blocksG1: 1, dataG1: 108, blocksG2: 0, dataG2: 0 },
    M: { totalData: 86, ecPerBlock: 24, blocksG1: 2, dataG1: 43, blocksG2: 0, dataG2: 0 },
    Q: { totalData: 62, ecPerBlock: 18, blocksG1: 2, dataG1: 15, blocksG2: 2, dataG2: 16 },
    H: { totalData: 46, ecPerBlock: 22, blocksG1: 2, dataG1: 11, blocksG2: 2, dataG2: 12 },
  },
  6: {
    L: { totalData: 136, ecPerBlock: 18, blocksG1: 2, dataG1: 68, blocksG2: 0, dataG2: 0 },
    M: { totalData: 108, ecPerBlock: 16, blocksG1: 4, dataG1: 27, blocksG2: 0, dataG2: 0 },
    Q: { totalData: 76, ecPerBlock: 24, blocksG1: 4, dataG1: 19, blocksG2: 0, dataG2: 0 },
    H: { totalData: 60, ecPerBlock: 28, blocksG1: 4, dataG1: 15, blocksG2: 0, dataG2: 0 },
  },
  7: {
    L: { totalData: 156, ecPerBlock: 20, blocksG1: 2, dataG1: 78, blocksG2: 0, dataG2: 0 },
    M: { totalData: 124, ecPerBlock: 18, blocksG1: 4, dataG1: 31, blocksG2: 0, dataG2: 0 },
    Q: { totalData: 88, ecPerBlock: 18, blocksG1: 2, dataG1: 14, blocksG2: 4, dataG2: 15 },
    H: { totalData: 66, ecPerBlock: 26, blocksG1: 4, dataG1: 13, blocksG2: 1, dataG2: 14 },
  },
  8: {
    L: { totalData: 194, ecPerBlock: 24, blocksG1: 2, dataG1: 97, blocksG2: 0, dataG2: 0 },
    M: { totalData: 154, ecPerBlock: 22, blocksG1: 2, dataG1: 38, blocksG2: 2, dataG2: 39 },
    Q: { totalData: 110, ecPerBlock: 22, blocksG1: 4, dataG1: 18, blocksG2: 2, dataG2: 19 },
    H: { totalData: 86, ecPerBlock: 26, blocksG1: 4, dataG1: 14, blocksG2: 2, dataG2: 15 },
  },
  9: {
    L: { totalData: 232, ecPerBlock: 30, blocksG1: 2, dataG1: 116, blocksG2: 0, dataG2: 0 },
    M: { totalData: 182, ecPerBlock: 22, blocksG1: 3, dataG1: 36, blocksG2: 2, dataG2: 37 },
    Q: { totalData: 132, ecPerBlock: 20, blocksG1: 4, dataG1: 16, blocksG2: 4, dataG2: 17 },
    H: { totalData: 100, ecPerBlock: 24, blocksG1: 4, dataG1: 12, blocksG2: 4, dataG2: 13 },
  },
  10: {
    L: { totalData: 274, ecPerBlock: 18, blocksG1: 2, dataG1: 68, blocksG2: 2, dataG2: 69 },
    M: { totalData: 216, ecPerBlock: 26, blocksG1: 4, dataG1: 43, blocksG2: 1, dataG2: 44 },
    Q: { totalData: 154, ecPerBlock: 24, blocksG1: 6, dataG1: 19, blocksG2: 2, dataG2: 20 },
    H: { totalData: 122, ecPerBlock: 28, blocksG1: 6, dataG1: 15, blocksG2: 2, dataG2: 16 },
  },
};

const ALIGNMENT_PATTERN_POSITIONS: Record<number, number[]> = {
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

const FORMAT_BITS: Record<QrErrorCorrectionLevel, number[]> = {
  L: [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976],
  M: [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0],
  Q: [0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed],
  H: [0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b],
};

class BitBuffer {
  private buffer: number[] = [];
  private length = 0;

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }

  getBuffer(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  getLength(): number {
    return this.length;
  }
}

function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function findMinVersion(dataByteLength: number, ecLevel: QrErrorCorrectionLevel): number {
  // Byte mode header: 4 bits mode + 8 or 16 bits character count indicator
  for (let v = 1; v <= 10; v++) {
    const charCountBits = v < 10 ? 8 : 16;
    const requiredBits = 4 + charCountBits + dataByteLength * 8;
    const totalDataCapacity = QR_VERSION_SPECS[v][ecLevel].totalData * 8;
    if (requiredBits <= totalDataCapacity) {
      return v;
    }
  }
  throw new Error(`Data too long for QR Code generator (${dataByteLength} bytes at EC Level ${ecLevel})`);
}

export function generateQrMatrix(text: string, ecLevel: QrErrorCorrectionLevel = 'M'): boolean[][] {
  const utf8 = encodeUtf8(text);
  const version = findMinVersion(utf8.length, ecLevel);
  const spec = QR_VERSION_SPECS[version][ecLevel];

  const bb = new BitBuffer();
  // Byte Mode (0100)
  bb.put(0x04, 4);
  // Character count
  const countBits = version < 10 ? 8 : 16;
  bb.put(utf8.length, countBits);
  // Data
  for (let i = 0; i < utf8.length; i++) {
    bb.put(utf8[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const totalBits = spec.totalData * 8;
  const terminator = Math.min(4, totalBits - bb.getLength());
  bb.put(0, terminator);

  // Align to byte boundary
  while (bb.getLength() % 8 !== 0) {
    bb.putBit(false);
  }

  // Pad bytes alternating 0xEC and 0x11
  const rawBytes = bb.getBuffer();
  const dataBytes = new Uint8Array(spec.totalData);
  dataBytes.set(rawBytes);
  let pad = 0xec;
  for (let i = rawBytes.length; i < spec.totalData; i++) {
    dataBytes[i] = pad;
    pad = pad === 0xec ? 0x11 : 0xec;
  }

  // Split into blocks and compute Reed-Solomon EC
  const totalBlocks = spec.blocksG1 + spec.blocksG2;
  const blocksData: Uint8Array[] = [];
  const blocksEc: Uint8Array[] = [];
  let byteOffset = 0;

  for (let b = 0; b < totalBlocks; b++) {
    const isG1 = b < spec.blocksG1;
    const blockSize = isG1 ? spec.dataG1 : spec.dataG2;
    const blockData = dataBytes.slice(byteOffset, byteOffset + blockSize);
    byteOffset += blockSize;
    blocksData.push(blockData);
    blocksEc.push(rsEncode(blockData, spec.ecPerBlock));
  }

  // Interleave data codewords
  const finalCodewords: number[] = [];
  const maxDataLen = Math.max(spec.dataG1, spec.dataG2);
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      if (i < blocksData[b].length) {
        finalCodewords.push(blocksData[b][i]);
      }
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      finalCodewords.push(blocksEc[b][i]);
    }
  }

  // Convert codewords to bits
  const finalBits: boolean[] = [];
  for (let i = 0; i < finalCodewords.length; i++) {
    for (let bit = 7; bit >= 0; bit--) {
      finalBits.push(((finalCodewords[i] >>> bit) & 1) === 1);
    }
  }

  // Grid initialization
  const size = version * 4 + 17;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (top-left, top-right, bottom-left)
  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          isFunction[tr][tc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            matrix[tr][tc] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          } else {
            matrix[tr][tc] = false; // Separator
          }
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    isFunction[6][i] = true;
    matrix[6][i] = i % 2 === 0;
    isFunction[i][6] = true;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment patterns for version >= 2
  const alignCoords = ALIGNMENT_PATTERN_POSITIONS[version] || [];
  for (const r of alignCoords) {
    for (const c of alignCoords) {
      if (isFunction[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const tr = r + dr;
          const tc = c + dc;
          isFunction[tr][tc] = true;
          matrix[tr][tc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
        }
      }
    }
  }

  // Dark module
  isFunction[size - 8][8] = true;
  matrix[size - 8][8] = true;

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    isFunction[8][i] = true;
    isFunction[i][8] = true;
  }
  for (let i = size - 8; i < size; i++) {
    isFunction[8][i] = true;
    isFunction[i][8] = true;
  }

  // Mask function
  function getMask(mask: number, r: number, c: number): boolean {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2 + (r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return false;
    }
  }

  // Place data bits in zigzag order (using mask 0 for deterministic high contrast)
  const chosenMask = 0;
  let bitIdx = 0;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing pattern
    const upward = ((right + 1) / 2) % 2 === 1;
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (let c = right; c > right - 2; c--) {
        if (!isFunction[r][c]) {
          const bitVal = bitIdx < finalBits.length ? finalBits[bitIdx] : false;
          matrix[r][c] = bitVal !== getMask(chosenMask, r, c);
          bitIdx++;
        }
      }
    }
  }

  // Write format information (mask 0)
  const formatBits = FORMAT_BITS[ecLevel][chosenMask];
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >>> i) & 1) === 1;
    // Around top-left finder
    if (i <= 5) matrix[8][i] = bit;
    else if (i === 6) matrix[8][7] = bit;
    else if (i === 7) matrix[8][8] = bit;
    else if (i === 8) matrix[7][8] = bit;
    else matrix[14 - i][8] = bit;

    // Around top-right and bottom-left finders
    if (i < 8) matrix[size - 1 - i][8] = bit;
    else matrix[8][size - 15 + i] = bit;
  }

  return matrix;
}

/**
 * Renders the QR code as clean, resolution-independent SVG markup.
 */
export function generateQrSvg(text: string, options: QrRenderOptions = {}): string {
  const {
    size = 240,
    margin = 2,
    darkColor = '#111111',
    lightColor = '#ffffff',
    ecLevel = 'M',
  } = options;

  const matrix = generateQrMatrix(text, ecLevel);
  const matrixSize = matrix.length;
  const viewBoxSize = matrixSize + margin * 2;

  let pathData = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        pathData += `M${c + margin},${r + margin}h1v1h-1z `;
      }
    }
  }

  const bgRect = lightColor && lightColor !== 'transparent'
    ? `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${lightColor}" />`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" shape-rendering="crispEdges">${bgRect}<path d="${pathData.trim()}" fill="${darkColor}" /></svg>`;
}

/**
 * Draws the QR Code directly to an HTML Canvas (e.g. for 300 DPI image downloads).
 */
export function drawQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: QrRenderOptions = {}
): void {
  const {
    size = 600,
    margin = 2,
    darkColor = '#111111',
    lightColor = '#ffffff',
    ecLevel = 'M',
  } = options;

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const matrix = generateQrMatrix(text, ecLevel);
  const matrixSize = matrix.length;
  const totalModules = matrixSize + margin * 2;

  if (lightColor && lightColor !== 'transparent') {
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  const modulePixelSize = size / totalModules;
  ctx.fillStyle = darkColor;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = Math.round((c + margin) * modulePixelSize);
        const y = Math.round((r + margin) * modulePixelSize);
        const w = Math.ceil(modulePixelSize);
        const h = Math.ceil(modulePixelSize);
        ctx.fillRect(x, y, w, h);
      }
    }
  }
}
