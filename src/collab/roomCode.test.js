import { describe, it, expect } from 'vitest';
import { generateRoomCode, isValidRoomCode } from './roomCode.js';

describe('roomCode', () => {
  it('generateRoomCode returns WORD-WORD-NN format', () => {
    const c = generateRoomCode();
    expect(c).toMatch(/^[A-Z]+-[A-Z]+-\d{2}$/);
  });

  it('generates different codes across many calls', () => {
    const set = new Set(Array.from({ length: 50 }, () => generateRoomCode()));
    expect(set.size).toBeGreaterThan(30); // high-entropy
  });

  it('isValidRoomCode accepts the format', () => {
    expect(isValidRoomCode('PLUM-FOX-73')).toBe(true);
    expect(isValidRoomCode('RED-CAT-01')).toBe(true);
  });

  it('isValidRoomCode rejects garbage', () => {
    expect(isValidRoomCode('')).toBe(false);
    expect(isValidRoomCode('plum-fox-73')).toBe(false); // lowercase
    expect(isValidRoomCode('PLUM_FOX_73')).toBe(false); // underscore
    expect(isValidRoomCode('PLUM-FOX')).toBe(false);
    expect(isValidRoomCode(null)).toBe(false);
  });
});
