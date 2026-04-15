import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  persistSessionMeta, readSessionMeta, clearSessionMeta,
  persistSessionState, readSessionState, clearSessionState,
  SESSION_META_KEY, SESSION_STATE_KEY,
  _resetThrottle,
} from './recovery.js';

// Simple localStorage mock for tests
const localStorageMock = {
  store: {},
  clear() { this.store = {}; },
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; },
  key(index) { const keys = Object.keys(this.store); return keys[index] || null; },
  get length() { return Object.keys(this.store).length; },
};

// Replace global localStorage with our mock for tests
if (typeof global !== 'undefined') {
  global.localStorage = localStorageMock;
}

describe('recovery', () => {
  beforeEach(() => {
    localStorageMock.clear();
    _resetThrottle();
    vi.useRealTimers();
  });

  it('persistSessionMeta writes role/roomCode/transport to localStorage', () => {
    persistSessionMeta({ roomCode: 'R', role: 'teacher', transport: 'webrtc' });
    const raw = JSON.parse(localStorage.getItem(SESSION_META_KEY));
    expect(raw).toEqual({ roomCode: 'R', role: 'teacher', transport: 'webrtc' });
  });

  it('readSessionMeta returns null when absent', () => {
    expect(readSessionMeta()).toBeNull();
  });

  it('readSessionMeta returns null on malformed json', () => {
    localStorage.setItem(SESSION_META_KEY, '{not json');
    expect(readSessionMeta()).toBeNull();
  });

  it('clearSessionMeta removes the key', () => {
    persistSessionMeta({ roomCode: 'R', role: 'student', transport: 'webrtc' });
    clearSessionMeta();
    expect(localStorage.getItem(SESSION_META_KEY)).toBeNull();
  });

  it('persistSessionState throttles to ~1 write per second', () => {
    vi.useFakeTimers();
    persistSessionState({ view: 'a' });
    persistSessionState({ view: 'b' });
    persistSessionState({ view: 'c' });
    // First call is immediate; subsequent ones are debounced.
    expect(JSON.parse(localStorage.getItem(SESSION_STATE_KEY)).view).toBe('a');
    vi.advanceTimersByTime(1100);
    expect(JSON.parse(localStorage.getItem(SESSION_STATE_KEY)).view).toBe('c');
  });

  it('readSessionState returns the last persisted snapshot', () => {
    persistSessionState({ view: 'lesson', exerciseIndex: 2 });
    expect(readSessionState()).toEqual({ view: 'lesson', exerciseIndex: 2 });
  });

  it('clearSessionState removes the key and cancels pending writes', () => {
    vi.useFakeTimers();
    persistSessionState({ view: 'a' });
    persistSessionState({ view: 'b' }); // debounced
    clearSessionState();
    vi.advanceTimersByTime(2000);
    expect(localStorage.getItem(SESSION_STATE_KEY)).toBeNull();
  });
});
