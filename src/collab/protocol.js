export const PROTOCOL_VERSION = 1;

export const MSG = Object.freeze({
  HELLO: 'hello',
  BYE: 'bye',
  SNAPSHOT: 'snapshot',
  NAVIGATE: 'navigate',
  INPUT: 'input',
  SUBMIT: 'submit',
  REVEAL: 'reveal',
  MARK: 'mark',
});

const KNOWN_TYPES = new Set(Object.values(MSG));

export function makeMessage(type, payload) {
  return { v: PROTOCOL_VERSION, type, payload };
}

export function isValidMessage(m) {
  if (!m || typeof m !== 'object') return false;
  if (m.v !== PROTOCOL_VERSION) return false;
  if (typeof m.type !== 'string' || !KNOWN_TYPES.has(m.type)) return false;
  if (!m.payload || typeof m.payload !== 'object' || Array.isArray(m.payload)) return false;
  return true;
}
