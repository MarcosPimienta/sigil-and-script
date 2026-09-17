import { describe, it, expect } from 'vitest';
import { generateQrMatrix, generateQrSvg, drawQrToCanvas } from './qrcode';

describe('QR Code Generator Utility', () => {
  it('generates a valid square boolean matrix for a URL', () => {
    const matrix = generateQrMatrix('https://sigil-and-script.vercel.app/invite/test-guest-123', 'M');
    expect(Array.isArray(matrix)).toBe(true);
    expect(matrix.length).toBeGreaterThanOrEqual(21);
    expect(matrix[0].length).toBe(matrix.length);
    // Finders at (0,0), (0, end), (end, 0) should have dark modules
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][matrix.length - 1]).toBe(true);
    expect(matrix[matrix.length - 1][0]).toBe(true);
  });

  it('generates valid SVG markup with width, height and path elements', () => {
    const svg = generateQrSvg('https://sigil-and-script.vercel.app/invite/guest-abc', {
      size: 300,
      margin: 4,
      darkColor: '#2b2622',
      lightColor: '#fcf8f2',
      ecLevel: 'H',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('width="300"');
    expect(svg).toContain('height="300"');
    expect(svg).toContain('fill="#fcf8f2"');
    expect(svg).toContain('fill="#2b2622"');
    expect(svg).toContain('<path');
  });

  it('supports transparent background when lightColor is transparent', () => {
    const svg = generateQrSvg('https://example.com/test', {
      lightColor: 'transparent',
    });
    expect(svg).not.toContain('<rect');
  });

  it('draws to an HTML canvas context without error', () => {
    const canvas = document.createElement('canvas');
    drawQrToCanvas(canvas, 'https://example.com/invite/12345', {
      size: 400,
      darkColor: '#000000',
    });

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(400);
  });
});
