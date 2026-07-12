import { describe, it, expect } from 'vitest';
import { parseGuestCsv, parseCsvLine } from './csvParser';

describe('CSV Parser tests', () => {
  it('should parse simple lines', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('should parse double quoted lines', () => {
    expect(parseCsvLine('"John, Smith",john@example.com')).toEqual(['John, Smith', 'john@example.com']);
  });

  it('should parse guest lists with headers', () => {
    const csv = `name,email\nAlice,alice@example.com\nBob,bob@example.com`;
    const parsed = parseGuestCsv(csv);
    expect(parsed).toEqual([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ]);
  });

  it('should fallback to default indexes when headers are missing', () => {
    const csv = `Alice,alice@example.com\nBob,bob@example.com`;
    const parsed = parseGuestCsv(csv);
    expect(parsed).toEqual([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ]);
  });

  it('should handle quoted strings with commas and escaped quotes', () => {
    const csv = `name,email\n"Smith, ""Jack""",jack@example.com`;
    const parsed = parseGuestCsv(csv);
    expect(parsed).toEqual([
      { name: 'Smith, "Jack"', email: 'jack@example.com' },
    ]);
  });
});
