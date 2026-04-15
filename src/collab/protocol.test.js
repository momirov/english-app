import { describe, it, expect } from 'vitest';
import { PROTOCOL_VERSION, MSG, makeMessage, isValidMessage } from './protocol.js';

describe('protocol', () => {
  it('PROTOCOL_VERSION is 1', () => {
    expect(PROTOCOL_VERSION).toBe(1);
  });

  it('MSG exposes all message type constants', () => {
    expect(MSG.HELLO).toBe('hello');
    expect(MSG.BYE).toBe('bye');
    expect(MSG.SNAPSHOT).toBe('snapshot');
    expect(MSG.NAVIGATE).toBe('navigate');
    expect(MSG.INPUT).toBe('input');
    expect(MSG.SUBMIT).toBe('submit');
    expect(MSG.REVEAL).toBe('reveal');
    expect(MSG.MARK).toBe('mark');
  });

  it('makeMessage wraps type+payload with version', () => {
    const m = makeMessage(MSG.INPUT, { exerciseIndex: 2, field: 'value', value: 'hi' });
    expect(m).toEqual({
      v: 1,
      type: 'input',
      payload: { exerciseIndex: 2, field: 'value', value: 'hi' },
    });
  });

  it('isValidMessage accepts well-formed messages', () => {
    expect(isValidMessage({ v: 1, type: 'hello', payload: { role: 'teacher', clientVersion: '1.0' } })).toBe(true);
    expect(isValidMessage({ v: 1, type: 'navigate', payload: { path: '/unit1/unit1-vocab1/0' } })).toBe(true);
  });

  it('isValidMessage rejects malformed messages', () => {
    expect(isValidMessage(null)).toBe(false);
    expect(isValidMessage(undefined)).toBe(false);
    expect(isValidMessage({})).toBe(false);
    expect(isValidMessage({ v: 1, type: 'unknown', payload: {} })).toBe(false);
    expect(isValidMessage({ v: 2, type: 'hello', payload: {} })).toBe(false);
    expect(isValidMessage({ v: 1, type: 'hello' })).toBe(false); // no payload
    expect(isValidMessage('string')).toBe(false);
  });
});
