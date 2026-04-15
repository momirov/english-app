export const SESSION_META_KEY = 'ep1_session';
export const SESSION_STATE_KEY = 'ep1_session_state';

export function persistSessionMeta({ roomCode, role, transport }) {
  localStorage.setItem(SESSION_META_KEY, JSON.stringify({ roomCode, role, transport }));
}

export function readSessionMeta() {
  const raw = localStorage.getItem(SESSION_META_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearSessionMeta() {
  localStorage.removeItem(SESSION_META_KEY);
}

// Leading-edge + trailing-edge throttle @ 1/sec.
let lastWriteAt = 0;
let pendingTimer = null;
let pendingValue = null;
const THROTTLE_MS = 1000;

// Expose reset for testing purposes
export function _resetThrottle() {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  lastWriteAt = 0;
  pendingValue = null;
}

function writeNow(v) {
  lastWriteAt = Date.now();
  localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(v));
}

export function persistSessionState(state) {
  const now = Date.now();
  if (now - lastWriteAt >= THROTTLE_MS) {
    writeNow(state);
    return;
  }
  pendingValue = state;
  if (pendingTimer) return;
  pendingTimer = setTimeout(() => {
    if (pendingValue) writeNow(pendingValue);
    pendingTimer = null;
    pendingValue = null;
  }, THROTTLE_MS - (now - lastWriteAt));
}

export function readSessionState() {
  const raw = localStorage.getItem(SESSION_STATE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearSessionState() {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
    pendingValue = null;
  }
  lastWriteAt = 0;
  localStorage.removeItem(SESSION_STATE_KEY);
}
