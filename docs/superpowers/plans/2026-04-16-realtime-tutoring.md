# Realtime Tutoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 1:1 live teacher-student tutoring over the existing exercise flow, with a pluggable transport abstraction (WebRTC first), last-write-wins shared interactive mirror, and zero impact on solo practice.

**Architecture:** Four layers — UI, Session (app-agnostic state), Protocol (typed JSON messages), Transport (pluggable: WebRTC/PeerJS now, PartyKit/WebSocket later). Session state is held in memory; a throttled localStorage snapshot enables transparent refresh. Navigation syncs via Wouter URL paths. Exercise working state syncs via a `useCollabField` hook that replaces `useState`.

**Tech Stack:** React 19, Wouter routing, PeerJS (new dep, `^1.5.x`), Vitest + @testing-library/react for tests.

**Spec:** `docs/superpowers/specs/2026-04-16-realtime-tutoring-design.md`

**Implementation notes (adjustments to spec discovered from code):**
- Navigation is URL-driven via Wouter, so the `navigate` protocol message carries `{ path }` (full URL path) rather than `{ view, unitId, lessonId }`. This also collapses the spec's `next-exercise` message into `navigate`.
- `ExerciseRunner.jsx` currently uses `key={Math.random()}` on rendered exercises — this is incompatible with collab sync (subscriptions would reset every render) and must be changed to `key={currentIdx}`.
- Protocol message list: `hello`, `bye`, `snapshot`, `navigate`, `input`, `submit`, `reveal`, `mark`.
- **Deferred to v2:** explicit UI buttons for `reveal` and `mark`, plus protocol-version-skew warning. The message types are defined in the protocol module so the wire format is stable for the future. Since co-pilot mode lets the teacher type/click directly (last-write-wins), these are additive niceties, not core path.
- **Header is not shown on home page** (UnitGrid has no Header). So the teacher's **Start session** button must live at App root, next to SessionBanner, not inside Header.

---

## Task 1: Install PeerJS and scaffold `src/collab/`

**Files:**
- Modify: `package.json` (add `peerjs` dependency)
- Create: `src/collab/.keep` (placeholder so directory is committed)

- [ ] **Step 1: Install peerjs**

Run:
```bash
npm install peerjs@^1.5.0
```

Expected: entry added to `dependencies` in `package.json`, `peerjs` appears under `node_modules/`.

- [ ] **Step 2: Create the collab directory**

Run:
```bash
mkdir -p src/collab/transports src/components/collab
touch src/collab/.keep src/components/collab/.keep
```

- [ ] **Step 3: Verify install**

Run:
```bash
node -e "console.log(require('peerjs/package.json').version)"
```
Expected: prints a version string starting with `1.5`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/collab/.keep src/components/collab/.keep
git commit -m "chore: add peerjs dependency and collab directories"
```

---

## Task 2: Protocol module — constants, `makeMessage`, `isValidMessage`

**Files:**
- Create: `src/collab/protocol.js`
- Create: `src/collab/protocol.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/collab/protocol.test.js`:
```js
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
```

- [ ] **Step 2: Run the tests — they should fail**

Run: `npm test -- src/collab/protocol.test.js`
Expected: all tests fail with "Cannot find module './protocol.js'" or similar.

- [ ] **Step 3: Implement `protocol.js`**

Create `src/collab/protocol.js`:
```js
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
  if (!m.payload || typeof m.payload !== 'object') return false;
  return true;
}
```

- [ ] **Step 4: Run the tests — they should pass**

Run: `npm test -- src/collab/protocol.test.js`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/collab/protocol.js src/collab/protocol.test.js
git commit -m "feat(collab): add protocol module with typed messages and validator"
```

---

## Task 3: Transport interface types + `MemoryTransport` for tests

**Files:**
- Create: `src/collab/transport.js` (types + factory)
- Create: `src/collab/transports/memory.js`
- Create: `src/collab/transports/memory.test.js`

`MemoryTransport` is the drop-in used by integration tests. It connects two `RoomHandle`s in-process with no network. Proving the contract here first ensures the interface is real before we wire WebRTC.

- [ ] **Step 1: Write the failing tests**

Create `src/collab/transports/memory.test.js`:
```js
import { describe, it, expect, vi } from 'vitest';
import { createMemoryTransportPair } from './memory.js';

describe('MemoryTransport', () => {
  it('creates a paired teacher+student handle with the same room code', async () => {
    const { teacher: tPromise, student: sPromise } = createMemoryTransportPair('ROOM-1');
    const teacher = await tPromise.createRoom();
    const student = await sPromise.joinRoom('ROOM-1');
    expect(teacher.roomCode).toBe('ROOM-1');
    expect(student.roomCode).toBe('ROOM-1');
    expect(teacher.role).toBe('teacher');
    expect(student.role).toBe('student');
  });

  it('relays messages from one side to the other', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const student = await pair.student.joinRoom('R');
    const received = vi.fn();
    student.onMessage(received);
    teacher.send({ hello: 'world' });
    expect(received).toHaveBeenCalledWith({ hello: 'world' });
  });

  it('fires peer-state connected when both sides are ready', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const handler = vi.fn();
    teacher.onPeerState(handler);
    await pair.student.joinRoom('R');
    expect(handler).toHaveBeenCalledWith('connected');
  });

  it('fires disconnected on close', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const student = await pair.student.joinRoom('R');
    const handler = vi.fn();
    student.onPeerState(handler);
    teacher.close();
    expect(handler).toHaveBeenCalledWith('disconnected');
  });

  it('unsubscribes correctly', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const student = await pair.student.joinRoom('R');
    const handler = vi.fn();
    const unsub = student.onMessage(handler);
    unsub();
    teacher.send({ a: 1 });
    expect(handler).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests — they should fail**

Run: `npm test -- src/collab/transports/memory.test.js`
Expected: fails with "Cannot find module './memory.js'".

- [ ] **Step 3: Write the transport type docs**

Create `src/collab/transport.js`:
```js
/**
 * @typedef {Object} Transport
 * @property {() => Promise<RoomHandle>} createRoom
 * @property {(roomCode: string) => Promise<RoomHandle>} joinRoom
 */

/**
 * @typedef {Object} RoomHandle
 * @property {string} roomCode
 * @property {'teacher'|'student'} role
 * @property {(msg: object) => void} send
 * @property {(fn: (msg: object) => void) => () => void} onMessage
 * @property {(fn: ('connected'|'disconnected') => void) => () => void} onPeerState
 * @property {() => void} close
 */

// Factory selector — populated as transports are added.
export async function createTransport(kind) {
  if (kind === 'webrtc') {
    const { createWebRtcTransport } = await import('./transports/webrtc.js');
    return createWebRtcTransport();
  }
  throw new Error(`Unknown transport: ${kind}`);
}
```

- [ ] **Step 4: Implement MemoryTransport**

Create `src/collab/transports/memory.js`:
```js
// In-process paired transport for tests.
// Usage:
//   const { teacher, student } = createMemoryTransportPair('ROOM');
//   const t = await teacher.createRoom();
//   const s = await student.joinRoom('ROOM');

function makeHandle(roomCode, role, otherHandleRef) {
  const messageSubs = new Set();
  const peerSubs = new Set();
  let closed = false;
  const handle = {
    roomCode,
    role,
    send(msg) {
      if (closed) return;
      const other = otherHandleRef.current;
      if (!other || other.__closed) return;
      for (const fn of other.__messageSubs) fn(msg);
    },
    onMessage(fn) {
      messageSubs.add(fn);
      return () => messageSubs.delete(fn);
    },
    onPeerState(fn) {
      peerSubs.add(fn);
      return () => peerSubs.delete(fn);
    },
    close() {
      if (closed) return;
      closed = true;
      handle.__closed = true;
      const other = otherHandleRef.current;
      if (other && !other.__closed) {
        for (const fn of other.__peerSubs) fn('disconnected');
      }
    },
    __messageSubs: messageSubs,
    __peerSubs: peerSubs,
    __closed: closed,
  };
  return handle;
}

export function createMemoryTransportPair(roomCode) {
  const teacherRef = { current: null };
  const studentRef = { current: null };

  const teacher = {
    async createRoom() {
      const h = makeHandle(roomCode, 'teacher', studentRef);
      teacherRef.current = h;
      return h;
    },
    async joinRoom() {
      throw new Error('teacher side uses createRoom');
    },
  };

  const student = {
    async createRoom() {
      throw new Error('student side uses joinRoom');
    },
    async joinRoom(code) {
      if (code !== roomCode) throw new Error('room not found');
      const h = makeHandle(roomCode, 'student', teacherRef);
      studentRef.current = h;
      // Both sides now see each other — fire connected on both.
      if (teacherRef.current) {
        for (const fn of teacherRef.current.__peerSubs) fn('connected');
        for (const fn of h.__peerSubs) fn('connected');
      }
      return h;
    },
  };

  return { teacher, student };
}
```

- [ ] **Step 5: Run tests — they should pass**

Run: `npm test -- src/collab/transports/memory.test.js`
Expected: 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/collab/transport.js src/collab/transports/memory.js src/collab/transports/memory.test.js
git commit -m "feat(collab): add Transport interface and MemoryTransport for tests"
```

---

## Task 4: Friendly room-code generator

**Files:**
- Create: `src/collab/roomCode.js`
- Create: `src/collab/roomCode.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/collab/roomCode.test.js`:
```js
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
```

- [ ] **Step 2: Run tests — they should fail**

Run: `npm test -- src/collab/roomCode.test.js`
Expected: fails — module does not exist.

- [ ] **Step 3: Implement the generator**

Create `src/collab/roomCode.js`:
```js
// Short curated word list — unambiguous, no profanity, easy to say aloud.
const WORDS = [
  'ACE','APE','ARC','ASH','BAY','BEE','BOX','CAP','CAT','COW',
  'CUP','DAY','DOG','DOT','ELF','ELK','ELM','FAN','FIG','FIN',
  'FIR','FOG','FOX','GEM','HAT','HAY','HEN','HUB','ICE','INK',
  'JAM','JAR','JET','KEY','KID','KIN','LAB','LAD','LID','LIP',
  'LOG','MAP','MAT','MIX','MOM','MUG','NET','NUN','NUT','OAK',
  'OAR','OWL','PAD','PEA','PEN','PIE','PIG','PIN','PIT','PLUM',
  'POD','POT','RAM','RAT','RED','RIB','RIM','ROW','RUG','SKY',
  'SUN','TAB','TAN','TEA','TIE','TIN','TOE','TOP','TOY','TUB',
  'VAN','WEB','WIG','YAK','YAM','ZAP','ZIP',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRoomCode() {
  const a = pick(WORDS);
  const b = pick(WORDS);
  const n = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${a}-${b}-${n}`;
}

export function isValidRoomCode(s) {
  if (typeof s !== 'string') return false;
  return /^[A-Z]+-[A-Z]+-\d{2}$/.test(s);
}
```

- [ ] **Step 4: Run tests — they should pass**

Run: `npm test -- src/collab/roomCode.test.js`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/collab/roomCode.js src/collab/roomCode.test.js
git commit -m "feat(collab): add friendly room-code generator"
```

---

## Task 5: SessionManager state machine

**Files:**
- Create: `src/collab/session.js`
- Create: `src/collab/session.test.js`

The SessionManager wires transport ↔ protocol. It exposes `start`/`join`/`end`, emits `status` changes, handles `hello` → `snapshot` exchange, and broadcasts/receives typed messages. It does NOT implement retry/backoff yet — that lands in Task 13.

- [ ] **Step 1: Write the failing tests**

Create `src/collab/session.test.js`:
```js
import { describe, it, expect, vi } from 'vitest';
import { createSessionManager } from './session.js';
import { createMemoryTransportPair } from './transports/memory.js';
import { MSG } from './protocol.js';

function mkPair(code = 'R') {
  const pair = createMemoryTransportPair(code);
  return {
    teacher: createSessionManager({ transport: pair.teacher, clientVersion: '1.0' }),
    student: createSessionManager({ transport: pair.student, clientVersion: '1.0' }),
  };
}

describe('SessionManager', () => {
  it('starts in idle status', () => {
    const { teacher } = mkPair();
    expect(teacher.getStatus()).toBe('idle');
    expect(teacher.isActive).toBe(false);
  });

  it('transitions to connected after hello exchange', async () => {
    const { teacher, student } = mkPair('CODE');
    await teacher.start({ as: 'teacher', roomCode: 'CODE' });
    await student.join({ roomCode: 'CODE' });
    // Wait a microtask for hello messages to cross.
    await Promise.resolve();
    await Promise.resolve();
    expect(teacher.getStatus()).toBe('connected');
    expect(student.getStatus()).toBe('connected');
    expect(teacher.isActive).toBe(true);
  });

  it('broadcast sends typed messages to peer', async () => {
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    const handler = vi.fn();
    student.on(MSG.INPUT, handler);
    teacher.broadcast(MSG.INPUT, { exerciseIndex: 0, field: 'value', value: 'hi' });
    await Promise.resolve();
    expect(handler).toHaveBeenCalledWith({ exerciseIndex: 0, field: 'value', value: 'hi' });
  });

  it('drops malformed incoming messages silently', async () => {
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    const handler = vi.fn();
    student.on(MSG.INPUT, handler);
    // Send a raw malformed payload via the underlying transport.
    teacher._debug_sendRaw({ not: 'a valid message' });
    await Promise.resolve();
    expect(handler).not.toHaveBeenCalled();
  });

  it('end() closes and goes idle', async () => {
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    teacher.end();
    expect(teacher.getStatus()).toBe('idle');
  });

  it('peer disconnect sets peer-gone', async () => {
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    student.end();
    await Promise.resolve();
    expect(teacher.getStatus()).toBe('peer-gone');
  });

  it('notifies status subscribers', async () => {
    const { teacher, student } = mkPair('X');
    const statusChanges = [];
    teacher.onStatusChange((s) => statusChanges.push(s));
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    expect(statusChanges).toContain('connecting');
    expect(statusChanges).toContain('connected');
  });
});
```

- [ ] **Step 2: Run tests — they should fail**

Run: `npm test -- src/collab/session.test.js`
Expected: fails — module does not exist.

- [ ] **Step 3: Implement `session.js`**

Create `src/collab/session.js`:
```js
import { MSG, PROTOCOL_VERSION, makeMessage, isValidMessage } from './protocol.js';

/**
 * createSessionManager({ transport, clientVersion }) → SessionManager
 *
 *   transport: a Transport (see transport.js)
 *   clientVersion: string reported in hello; mismatches log a warning
 *
 * Returns an object with:
 *   getStatus()               -> 'idle'|'connecting'|'connected'|'peer-gone'|'error'
 *   isActive  (getter)        -> status === 'connected'
 *   onStatusChange(fn)        -> unsub
 *   start({ as, roomCode })   -> Promise<void>   // teacher
 *   join({ roomCode })        -> Promise<void>   // student
 *   end()                     -> void
 *   broadcast(type, payload)  -> void
 *   on(type, handler)         -> unsub           // receive typed payloads
 *   getRole()                 -> 'teacher'|'student'|null
 *   getRoomCode()             -> string|null
 *   _debug_sendRaw(obj)       -> void            // test-only
 */
export function createSessionManager({ transport, clientVersion }) {
  let status = 'idle';
  let role = null;
  let roomCode = null;
  let handle = null;
  const statusSubs = new Set();
  const typedSubs = new Map(); // type -> Set<fn>
  const snapshotSubs = new Set(); // hooks for snapshot sync (Task 6)

  function setStatus(next) {
    if (status === next) return;
    status = next;
    for (const fn of statusSubs) fn(status);
  }

  function emit(type, payload) {
    const subs = typedSubs.get(type);
    if (!subs) return;
    for (const fn of subs) fn(payload);
  }

  function onIncoming(m) {
    if (!isValidMessage(m)) {
      console.warn('[collab] dropped invalid message', m);
      return;
    }
    if (m.type === MSG.HELLO) {
      // Peer has arrived. Move to connected.
      setStatus('connected');
      // Ask subscribers (recovery hook) to build and send a snapshot.
      for (const fn of snapshotSubs) fn();
      return;
    }
    if (m.type === MSG.BYE) {
      teardown('idle');
      return;
    }
    emit(m.type, m.payload);
  }

  function onPeerState(s) {
    if (s === 'connected' && status === 'connecting') {
      // send hello
      handle.send(makeMessage(MSG.HELLO, { role, clientVersion }));
    } else if (s === 'disconnected' && (status === 'connected' || status === 'connecting')) {
      setStatus('peer-gone');
    }
  }

  async function attach(h, assignedRole, assignedCode) {
    handle = h;
    role = assignedRole;
    roomCode = assignedCode;
    setStatus('connecting');
    handle.onMessage(onIncoming);
    handle.onPeerState(onPeerState);
  }

  function teardown(finalStatus) {
    if (handle) {
      try { handle.close(); } catch {}
      handle = null;
    }
    role = null;
    roomCode = null;
    setStatus(finalStatus);
  }

  return {
    getStatus: () => status,
    get isActive() { return status === 'connected'; },
    getRole: () => role,
    getRoomCode: () => roomCode,
    onStatusChange(fn) {
      statusSubs.add(fn);
      return () => statusSubs.delete(fn);
    },
    async start({ as, roomCode: code }) {
      const h = await transport.createRoom(code);
      await attach(h, as, h.roomCode);
    },
    async join({ roomCode: code }) {
      const h = await transport.joinRoom(code);
      await attach(h, 'student', h.roomCode);
    },
    end() {
      if (handle) {
        try { handle.send(makeMessage(MSG.BYE, {})); } catch {}
      }
      teardown('idle');
    },
    broadcast(type, payload) {
      if (!handle) return;
      handle.send(makeMessage(type, payload));
    },
    on(type, handler) {
      let set = typedSubs.get(type);
      if (!set) { set = new Set(); typedSubs.set(type, set); }
      set.add(handler);
      return () => set.delete(handler);
    },
    // Used by recovery hook in Task 6.
    _onHelloReceived(fn) {
      snapshotSubs.add(fn);
      return () => snapshotSubs.delete(fn);
    },
    _debug_sendRaw(obj) {
      if (!handle) return;
      handle.send(obj);
    },
    _protocolVersion: PROTOCOL_VERSION,
  };
}
```

- [ ] **Step 4: Adjust MemoryTransport so `createRoom(code)` accepts the code**

Edit `src/collab/transports/memory.js` — change `createRoom()` to accept an optional `code`:
```js
const teacher = {
  async createRoom(code) {
    const finalCode = code || roomCode;
    const h = makeHandle(finalCode, 'teacher', studentRef);
    teacherRef.current = h;
    return h;
  },
  // ... rest unchanged
};
```

(The existing tests pass `undefined`; the new session tests pass a code. Both work.)

- [ ] **Step 5: Run tests — memory + session both should pass**

Run: `npm test -- src/collab/`
Expected: all protocol, memory, roomCode, and session tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/collab/session.js src/collab/session.test.js src/collab/transports/memory.js
git commit -m "feat(collab): add SessionManager state machine over Transport"
```

---

## Task 6: Recovery module — localStorage snapshot + hydrate

**Files:**
- Create: `src/collab/recovery.js`
- Create: `src/collab/recovery.test.js`

Two responsibilities:
1. `persistSessionMeta({roomCode, role, transport})` / `readSessionMeta()` / `clearSessionMeta()` — the `ep1_session` reconnect cookie.
2. `persistSessionState(state)` throttled 1/sec / `readSessionState()` / `clearSessionState()` — the `ep1_session_state` snapshot for refresh hydration.

- [ ] **Step 1: Write the failing tests**

Create `src/collab/recovery.test.js`:
```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  persistSessionMeta, readSessionMeta, clearSessionMeta,
  persistSessionState, readSessionState, clearSessionState,
  SESSION_META_KEY, SESSION_STATE_KEY,
} from './recovery.js';

describe('recovery', () => {
  beforeEach(() => {
    localStorage.clear();
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
```

- [ ] **Step 2: Run tests — they should fail**

Run: `npm test -- src/collab/recovery.test.js`
Expected: fails — module does not exist.

- [ ] **Step 3: Implement `recovery.js`**

Create `src/collab/recovery.js`:
```js
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
```

- [ ] **Step 4: Run tests — they should pass**

Run: `npm test -- src/collab/recovery.test.js`
Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/collab/recovery.js src/collab/recovery.test.js
git commit -m "feat(collab): add localStorage recovery — session meta + throttled state snapshot"
```

---

## Task 7: `useSession` React context + provider

**Files:**
- Create: `src/collab/useSession.jsx`
- Create: `src/collab/useSession.test.jsx`

The hook exposes `status`, `role`, `roomCode`, `isActive`, and the SessionManager methods. Components consume this via `useSession()`. The provider owns a single SessionManager instance.

- [ ] **Step 1: Write the failing tests**

Create `src/collab/useSession.test.jsx`:
```js
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SessionProvider, useSession } from './useSession.jsx';
import { createSessionManager } from './session.js';
import { createMemoryTransportPair } from './transports/memory.js';

function Probe() {
  const s = useSession();
  return (
    <div>
      <span data-testid="status">{s.status}</span>
      <span data-testid="active">{String(s.isActive)}</span>
    </div>
  );
}

describe('useSession', () => {
  it('exposes initial idle status', () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(
      <SessionProvider manager={mgr}>
        <Probe />
      </SessionProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(screen.getByTestId('active').textContent).toBe('false');
  });

  it('re-renders when status changes', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    render(
      <SessionProvider manager={teacher}>
        <Probe />
      </SessionProvider>
    );
    await act(async () => {
      await teacher.start({ as: 'teacher', roomCode: 'R' });
      await student.join({ roomCode: 'R' });
      await Promise.resolve();
    });
    expect(screen.getByTestId('status').textContent).toBe('connected');
    expect(screen.getByTestId('active').textContent).toBe('true');
  });
});
```

- [ ] **Step 2: Run tests — they should fail**

Run: `npm test -- src/collab/useSession.test.jsx`
Expected: module missing.

- [ ] **Step 3: Implement `useSession.jsx`**

Create `src/collab/useSession.jsx`:
```js
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ manager, children }) {
  const [status, setStatus] = useState(manager.getStatus());

  useEffect(() => {
    return manager.onStatusChange(setStatus);
  }, [manager]);

  const value = useMemo(() => ({
    status,
    isActive: status === 'connected',
    role: manager.getRole(),
    roomCode: manager.getRoomCode(),
    start: (...a) => manager.start(...a),
    join: (...a) => manager.join(...a),
    end: () => manager.end(),
    broadcast: (...a) => manager.broadcast(...a),
    on: (...a) => manager.on(...a),
    _manager: manager,
  }), [manager, status]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const v = useContext(SessionContext);
  if (!v) {
    // Fallback for components outside a session tree — behaves as idle.
    return {
      status: 'idle',
      isActive: false,
      role: null,
      roomCode: null,
      start: async () => {},
      join: async () => {},
      end: () => {},
      broadcast: () => {},
      on: () => () => {},
      _manager: null,
    };
  }
  return v;
}
```

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/collab/useSession.test.jsx`
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/collab/useSession.jsx src/collab/useSession.test.jsx
git commit -m "feat(collab): add SessionProvider and useSession React hook"
```

---

## Task 8: `useCollabField` — the useState seam

**Files:**
- Create: `src/collab/useCollabField.js`
- Create: `src/collab/useCollabField.test.jsx`

Drop-in replacement for `useState` scoped by (exerciseIndex, field). Requires a collab-scope provider so the hook knows the current `exerciseIndex` without each caller passing it.

- [ ] **Step 1: Write the failing tests**

Create `src/collab/useCollabField.test.jsx`:
```js
import { describe, it, expect, act } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionProvider } from './useSession.jsx';
import { CollabScope, useCollabField } from './useCollabField.js';
import { createSessionManager } from './session.js';
import { createMemoryTransportPair } from './transports/memory.js';
import { MSG } from './protocol.js';

function Probe() {
  const [val, setVal] = useCollabField('selected', null);
  return (
    <div>
      <span data-testid="val">{String(val)}</span>
      <button onClick={() => setVal('A')}>setA</button>
    </div>
  );
}

function setup(manager) {
  return render(
    <SessionProvider manager={manager}>
      <CollabScope exerciseIndex={0}>
        <Probe />
      </CollabScope>
    </SessionProvider>
  );
}

describe('useCollabField', () => {
  it('behaves like useState when idle', () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    setup(mgr);
    expect(screen.getByTestId('val').textContent).toBe('null');
    fireEvent.click(screen.getByText('setA'));
    expect(screen.getByTestId('val').textContent).toBe('A');
  });

  it('broadcasts input messages when connected', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    setup(teacher);
    await act(async () => {
      fireEvent.click(screen.getByText('setA'));
    });
    expect(received).toContainEqual({ exerciseIndex: 0, field: 'selected', value: 'A' });
  });

  it('applies remote input without re-broadcasting (no echo)', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();

    const echoed = [];
    teacher.on(MSG.INPUT, (p) => echoed.push(p));
    setup(student);
    await act(async () => {
      teacher.broadcast(MSG.INPUT, { exerciseIndex: 0, field: 'selected', value: 'B' });
      await Promise.resolve();
    });
    expect(screen.getByTestId('val').textContent).toBe('B');
    expect(echoed).toHaveLength(0); // student should not rebroadcast
  });
});
```

- [ ] **Step 2: Run tests — they should fail**

Run: `npm test -- src/collab/useCollabField.test.jsx`
Expected: module missing.

- [ ] **Step 3: Implement `useCollabField.js`**

Create `src/collab/useCollabField.js`:
```js
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSession } from './useSession.jsx';
import { MSG } from './protocol.js';

const CollabScopeContext = createContext({ exerciseIndex: null });

export function CollabScope({ exerciseIndex, children }) {
  return (
    <CollabScopeContext.Provider value={{ exerciseIndex }}>
      {children}
    </CollabScopeContext.Provider>
  );
}

export function useCollabField(field, initial) {
  const { exerciseIndex } = useContext(CollabScopeContext);
  const session = useSession();
  const [value, setValue] = useState(initial);
  // Flag to suppress broadcast when applying a remote update.
  const applyingRemote = useRef(false);

  // Subscribe to remote input messages for this (exerciseIndex, field).
  useEffect(() => {
    if (!session.isActive || exerciseIndex == null) return;
    return session.on(MSG.INPUT, (p) => {
      if (p.exerciseIndex !== exerciseIndex || p.field !== field) return;
      applyingRemote.current = true;
      setValue(p.value);
      // Reset flag on next microtask.
      queueMicrotask(() => { applyingRemote.current = false; });
    });
  }, [session, exerciseIndex, field]);

  function setAndBroadcast(next) {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      if (!applyingRemote.current && session.isActive && exerciseIndex != null) {
        session.broadcast(MSG.INPUT, { exerciseIndex, field, value: resolved });
      }
      return resolved;
    });
  }

  return [value, setAndBroadcast];
}
```

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/collab/useCollabField.test.jsx`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/collab/useCollabField.js src/collab/useCollabField.test.jsx
git commit -m "feat(collab): add useCollabField — useState replacement that syncs over session"
```

---

## Task 9: WebRTC (PeerJS) transport implementation

**Files:**
- Create: `src/collab/transports/webrtc.js`

PeerJS is hard to unit-test without network. We rely on the `Transport` contract tests passing via `MemoryTransport`, and manual smoke tests (Task 26). Keep this file focused: wrap PeerJS into the same shape as MemoryTransport.

- [ ] **Step 1: Implement the webrtc transport**

Create `src/collab/transports/webrtc.js`:
```js
import Peer from 'peerjs';
import { generateRoomCode } from '../roomCode.js';

function wrapConnection(conn, roomCode, role) {
  const messageSubs = new Set();
  const peerSubs = new Set();
  let closed = false;
  let openFired = false;

  conn.on('data', (data) => {
    for (const fn of messageSubs) fn(data);
  });
  conn.on('open', () => {
    openFired = true;
    for (const fn of peerSubs) fn('connected');
  });
  conn.on('close', () => {
    if (closed) return;
    closed = true;
    for (const fn of peerSubs) fn('disconnected');
  });
  conn.on('error', (e) => {
    console.warn('[collab/webrtc] conn error', e);
    if (closed) return;
    closed = true;
    for (const fn of peerSubs) fn('disconnected');
  });

  return {
    roomCode,
    role,
    send(msg) {
      if (closed) return;
      conn.send(msg);
    },
    onMessage(fn) {
      messageSubs.add(fn);
      return () => messageSubs.delete(fn);
    },
    onPeerState(fn) {
      peerSubs.add(fn);
      // If connection was already open when we subscribed, fire immediately.
      if (openFired && !closed) queueMicrotask(() => fn('connected'));
      return () => peerSubs.delete(fn);
    },
    close() {
      if (closed) return;
      closed = true;
      try { conn.close(); } catch {}
    },
  };
}

export function createWebRtcTransport() {
  return {
    async createRoom(providedCode) {
      // Try up to 3 times if the friendly code collides on the broker.
      let lastErr = null;
      for (let i = 0; i < 3; i++) {
        const code = providedCode || generateRoomCode();
        try {
          return await new Promise((resolve, reject) => {
            const peer = new Peer(code);
            let resolved = false;
            peer.on('open', (id) => {
              // Wait for a student to connect.
              peer.on('connection', (conn) => {
                if (resolved) return;
                resolved = true;
                resolve(wrapConnection(conn, id, 'teacher'));
              });
            });
            peer.on('error', (err) => {
              if (!resolved) {
                resolved = true;
                reject(err);
              }
            });
          });
        } catch (err) {
          lastErr = err;
          if (providedCode) throw err; // don't retry if caller chose the code
        }
      }
      throw lastErr;
    },

    async joinRoom(code) {
      return new Promise((resolve, reject) => {
        const peer = new Peer();
        let resolved = false;
        peer.on('open', () => {
          const conn = peer.connect(code, { reliable: true });
          conn.on('open', () => {
            if (resolved) return;
            resolved = true;
            resolve(wrapConnection(conn, code, 'student'));
          });
          conn.on('error', (err) => {
            if (!resolved) {
              resolved = true;
              reject(err);
            }
          });
        });
        peer.on('error', (err) => {
          if (!resolved) {
            resolved = true;
            reject(err);
          }
        });
      });
    },
  };
}
```

- [ ] **Step 2: Verify it loads without syntax errors**

Run:
```bash
node --input-type=module -e "import('./src/collab/transports/webrtc.js').then(m => console.log(Object.keys(m)))"
```
Expected: prints `[ 'createWebRtcTransport' ]` or similar. (Peer constructor won't run here — it's lazy.)

- [ ] **Step 3: Commit**

```bash
git add src/collab/transports/webrtc.js
git commit -m "feat(collab): add WebRTC (PeerJS) transport implementation"
```

---

## Task 10: SessionHostControls component (teacher's Start button + URL display)

**Files:**
- Create: `src/components/collab/SessionHostControls.jsx`
- Create: `src/components/collab/SessionHostControls.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/collab/SessionHostControls.test.jsx`:
```js
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SessionHostControls from './SessionHostControls.jsx';
import { SessionProvider } from '../../collab/useSession.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';

describe('SessionHostControls', () => {
  it('shows Start session button when idle', () => {
    const pair = createMemoryTransportPair('TEST-ROOM-00');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(<SessionProvider manager={mgr}><SessionHostControls /></SessionProvider>);
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
  });

  it('starts session and shows shareable URL after click', async () => {
    const pair = createMemoryTransportPair('ROOM-CODE-42');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(<SessionProvider manager={mgr}><SessionHostControls /></SessionProvider>);
    fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    await waitFor(() => {
      expect(screen.getByText(/ROOM-CODE-42/)).toBeInTheDocument();
    });
    // The displayed URL should include the ?session= param.
    const text = screen.getByTestId('session-url').textContent;
    expect(text).toMatch(/\?session=ROOM-CODE-42/);
  });
});
```

- [ ] **Step 2: Run tests — should fail**

Run: `npm test -- src/components/collab/SessionHostControls.test.jsx`
Expected: module missing.

- [ ] **Step 3: Implement the component**

Create `src/components/collab/SessionHostControls.jsx`:
```js
import { useState } from 'react';
import { useSession } from '../../collab/useSession.jsx';
import { generateRoomCode } from '../../collab/roomCode.js';

export default function SessionHostControls() {
  const session = useSession();
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setStarting(true);
    try {
      const code = generateRoomCode();
      await session.start({ as: 'teacher', roomCode: code });
    } catch (err) {
      console.error('[collab] failed to start session', err);
    } finally {
      setStarting(false);
    }
  }

  if (session.roomCode) {
    const url = `${window.location.origin}${window.location.pathname}?session=${session.roomCode}`;
    return (
      <div className="session-host-panel">
        <div>Share this link with your student:</div>
        <div data-testid="session-url" className="session-url">{url}</div>
        <button onClick={() => session.end()}>End session</button>
      </div>
    );
  }

  return (
    <button onClick={handleStart} disabled={starting}>
      {starting ? 'Starting…' : 'Start session'}
    </button>
  );
}
```

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/components/collab/SessionHostControls.test.jsx`
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/collab/SessionHostControls.jsx src/components/collab/SessionHostControls.test.jsx
git commit -m "feat(collab): add SessionHostControls — teacher start + shareable URL"
```

---

## Task 11: SessionJoinPrompt component

**Files:**
- Create: `src/components/collab/SessionJoinPrompt.jsx`
- Create: `src/components/collab/SessionJoinPrompt.test.jsx`

Shown when the app loads with `?session=CODE`. Asks the student to confirm.

- [ ] **Step 1: Write the failing test**

Create `src/components/collab/SessionJoinPrompt.test.jsx`:
```js
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionJoinPrompt from './SessionJoinPrompt.jsx';

describe('SessionJoinPrompt', () => {
  it('renders the room code', () => {
    render(<SessionJoinPrompt roomCode="RED-FOX-12" onAccept={() => {}} onDecline={() => {}} />);
    expect(screen.getByText(/RED-FOX-12/)).toBeInTheDocument();
  });

  it('calls onAccept when Join clicked', () => {
    const onAccept = vi.fn();
    render(<SessionJoinPrompt roomCode="R" onAccept={onAccept} onDecline={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /join/i }));
    expect(onAccept).toHaveBeenCalled();
  });

  it('calls onDecline when Cancel clicked', () => {
    const onDecline = vi.fn();
    render(<SessionJoinPrompt roomCode="R" onAccept={() => {}} onDecline={onDecline} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onDecline).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests — should fail**

Run: `npm test -- src/components/collab/SessionJoinPrompt.test.jsx`
Expected: module missing.

- [ ] **Step 3: Implement the component**

Create `src/components/collab/SessionJoinPrompt.jsx`:
```js
export default function SessionJoinPrompt({ roomCode, onAccept, onDecline }) {
  return (
    <div className="session-join-overlay" role="dialog" aria-modal="true">
      <div className="session-join-card">
        <h2>Join tutoring session?</h2>
        <p>
          Your teacher is inviting you to session <strong>{roomCode}</strong>.
          They'll see what you're doing and you can work through exercises together.
        </p>
        <div className="session-join-actions">
          <button onClick={onDecline}>Cancel</button>
          <button onClick={onAccept} className="primary">Join</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/components/collab/SessionJoinPrompt.test.jsx`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/collab/SessionJoinPrompt.jsx src/components/collab/SessionJoinPrompt.test.jsx
git commit -m "feat(collab): add SessionJoinPrompt dialog for student"
```

---

## Task 12: SessionBanner component

**Files:**
- Create: `src/components/collab/SessionBanner.jsx`
- Create: `src/components/collab/SessionBanner.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/collab/SessionBanner.test.jsx`:
```js
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SessionBanner from './SessionBanner.jsx';
import { SessionProvider } from '../../collab/useSession.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';

describe('SessionBanner', () => {
  it('is hidden when idle', () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(<SessionProvider manager={mgr}><SessionBanner /></SessionProvider>);
    expect(screen.queryByTestId('session-banner')).toBeNull();
  });

  it('shows connecting', async () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(<SessionProvider manager={mgr}><SessionBanner /></SessionProvider>);
    await act(async () => { mgr.start({ as: 'teacher', roomCode: 'R' }); });
    expect(screen.getByTestId('session-banner').textContent).toMatch(/connecting/i);
  });

  it('shows connected green text once peer joins', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    render(<SessionProvider manager={teacher}><SessionBanner /></SessionProvider>);
    await act(async () => {
      await teacher.start({ as: 'teacher', roomCode: 'R' });
      await student.join({ roomCode: 'R' });
      await Promise.resolve();
    });
    expect(screen.getByTestId('session-banner').textContent).toMatch(/live/i);
    expect(screen.getByTestId('session-banner').className).toMatch(/connected/);
  });

  it('shows peer-gone amber with practice-can-continue copy', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    render(<SessionProvider manager={teacher}><SessionBanner /></SessionProvider>);
    await act(async () => {
      await teacher.start({ as: 'teacher', roomCode: 'R' });
      await student.join({ roomCode: 'R' });
      await Promise.resolve();
      student.end();
      await Promise.resolve();
    });
    expect(screen.getByTestId('session-banner').textContent).toMatch(/keep practicing/i);
  });
});
```

- [ ] **Step 2: Run tests — should fail**

Run: `npm test -- src/components/collab/SessionBanner.test.jsx`
Expected: module missing.

- [ ] **Step 3: Implement the component**

Create `src/components/collab/SessionBanner.jsx`:
```js
import { useEffect, useState } from 'react';
import { useSession } from '../../collab/useSession.jsx';

export default function SessionBanner() {
  const { status } = useSession();
  const [dismissedErr, setDismissedErr] = useState(false);

  // Auto-dismiss the error banner after 5s.
  useEffect(() => {
    if (status !== 'error') { setDismissedErr(false); return; }
    const t = setTimeout(() => setDismissedErr(true), 5000);
    return () => clearTimeout(t);
  }, [status]);

  if (status === 'idle') return null;
  if (status === 'error' && dismissedErr) return null;

  const cfg = {
    connecting: { cls: 'connecting', text: '◌ Connecting…' },
    connected: { cls: 'connected', text: '● Live with teacher' },
    'peer-gone': { cls: 'peer-gone', text: '◌ Waiting for teacher — you can keep practicing' },
    error: { cls: 'error', text: '✕ Session ended — practicing solo' },
  }[status];

  if (!cfg) return null;

  return (
    <div data-testid="session-banner" className={`session-banner ${cfg.cls}`}>
      {cfg.text}
    </div>
  );
}
```

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/components/collab/SessionBanner.test.jsx`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/collab/SessionBanner.jsx src/components/collab/SessionBanner.test.jsx
git commit -m "feat(collab): add SessionBanner for non-blocking connection status"
```

---

## Task 13: Reconnect with exponential backoff + peer-gone 30s timeout

**Files:**
- Modify: `src/collab/session.js`
- Modify: `src/collab/session.test.js`

Add a `tryReconnect()` method and a 30s timer on `peer-gone` that auto-teardowns. This is kept distinct from Task 5 to make the state machine incremental.

- [ ] **Step 1: Add tests for reconnect and timeout behavior**

Append to `src/collab/session.test.js`:
```js
describe('SessionManager reconnect + peer-gone timeout', () => {
  it('goes to error after 5 failed reconnect attempts', async () => {
    const failing = {
      async createRoom() { throw new Error('no network'); },
      async joinRoom() { throw new Error('no network'); },
    };
    const mgr = createSessionManager({ transport: failing, clientVersion: '1.0' });
    const seen = [];
    mgr.onStatusChange((s) => seen.push(s));
    await mgr.tryReconnect({ as: 'student', roomCode: 'R', maxAttempts: 5, backoffMs: () => 0 });
    expect(mgr.getStatus()).toBe('error');
    expect(seen.filter(s => s === 'connecting').length).toBeGreaterThanOrEqual(1);
  });

  it('peer-gone auto-teardowns after timeout', async () => {
    vi.useFakeTimers();
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    student.end();
    await Promise.resolve();
    expect(teacher.getStatus()).toBe('peer-gone');
    await vi.advanceTimersByTimeAsync(30_000);
    expect(teacher.getStatus()).toBe('idle');
    vi.useRealTimers();
  });
});
```

Add the `vi` import at the top of the file if not already present.

- [ ] **Step 2: Run tests — should fail**

Run: `npm test -- src/collab/session.test.js`
Expected: the two new tests fail.

- [ ] **Step 3: Extend SessionManager**

In `src/collab/session.js`, add a `peerGoneTimer` ref and the timeout behavior inside `onPeerState`:

Replace the `onPeerState` function with:
```js
let peerGoneTimer = null;

function onPeerState(s) {
  if (s === 'connected') {
    if (peerGoneTimer) { clearTimeout(peerGoneTimer); peerGoneTimer = null; }
    if (status === 'connecting') {
      handle.send(makeMessage(MSG.HELLO, { role, clientVersion }));
    }
  } else if (s === 'disconnected' && (status === 'connected' || status === 'connecting')) {
    setStatus('peer-gone');
    peerGoneTimer = setTimeout(() => {
      peerGoneTimer = null;
      teardown('idle');
    }, 30_000);
  }
}
```

Update `teardown` to clear this timer:
```js
function teardown(finalStatus) {
  if (peerGoneTimer) { clearTimeout(peerGoneTimer); peerGoneTimer = null; }
  if (handle) { try { handle.close(); } catch {} handle = null; }
  role = null;
  roomCode = null;
  setStatus(finalStatus);
}
```

Add `tryReconnect` to the returned object:
```js
async tryReconnect({ as, roomCode: code, maxAttempts = 5, backoffMs = (i) => Math.min(500 * 2 ** i, 8000) }) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      if (as === 'teacher') await this.start({ as, roomCode: code });
      else await this.join({ roomCode: code });
      return true;
    } catch (e) {
      if (i < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, backoffMs(i)));
      }
    }
  }
  setStatus('error');
  return false;
},
```

Note: `this` inside the returned object refers to the object itself when called as `mgr.tryReconnect(...)`. If that feels fragile, store the return value in a `const api = { ... }; return api;` and reference `api`.

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/collab/session.test.js`
Expected: all session tests pass (original 7 + new 2 = 9).

- [ ] **Step 5: Commit**

```bash
git add src/collab/session.js src/collab/session.test.js
git commit -m "feat(collab): add reconnect backoff and 30s peer-gone timeout"
```

---

## Task 14: Snapshot exchange on hello — teacher & student catch-up

**Files:**
- Modify: `src/collab/session.js`
- Create: `src/collab/snapshot.js` — snapshot builder/applier helpers
- Create: `src/collab/snapshot.test.js`

We need a shared way to build a snapshot payload and apply an incoming one. The snapshot content (view/unit/lesson/URL path/submitted answers/field values) is assembled by the top-level app glue in Task 18. This task only builds the plumbing: a subscriber mechanism that lets the app provide a snapshot-builder and a snapshot-applier.

- [ ] **Step 1: Write the failing test**

Create `src/collab/snapshot.test.js`:
```js
import { describe, it, expect, vi } from 'vitest';
import { createSessionManager } from './session.js';
import { createMemoryTransportPair } from './transports/memory.js';
import { MSG } from './protocol.js';

describe('snapshot exchange', () => {
  it('sends snapshot in response to hello from peer', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });

    // Teacher provides a snapshot builder.
    teacher.setSnapshotBuilder(() => ({
      path: '/unit1/unit1-vocab1/2',
      fields: { '2:value': 'hello' },
      submitted: {},
    }));

    // Student subscribes to incoming snapshot messages.
    const received = [];
    student.on(MSG.SNAPSHOT, (p) => received.push(p));

    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    await Promise.resolve();

    expect(received).toHaveLength(1);
    expect(received[0].path).toBe('/unit1/unit1-vocab1/2');
  });
});
```

- [ ] **Step 2: Run tests — should fail**

Run: `npm test -- src/collab/snapshot.test.js`
Expected: `teacher.setSnapshotBuilder is not a function`.

- [ ] **Step 3: Extend SessionManager with setSnapshotBuilder**

In `src/collab/session.js`, add inside the returned object:
```js
let snapshotBuilder = null;

// ... inside the returned api:
setSnapshotBuilder(fn) { snapshotBuilder = fn; },
```

And modify the `onIncoming` HELLO branch to send a snapshot:
```js
if (m.type === MSG.HELLO) {
  setStatus('connected');
  if (snapshotBuilder) {
    try {
      const snap = snapshotBuilder();
      if (snap) handle.send(makeMessage(MSG.SNAPSHOT, snap));
    } catch (e) {
      console.warn('[collab] snapshot builder error', e);
    }
  }
  return;
}
```

Remove the old `snapshotSubs`/`_onHelloReceived` code from Task 5 — it's superseded by this cleaner version.

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/collab/snapshot.test.js src/collab/session.test.js`
Expected: snapshot test passes; session tests still pass.

- [ ] **Step 5: Commit**

```bash
git add src/collab/session.js src/collab/snapshot.test.js
git commit -m "feat(collab): snapshot exchange — peer sends snapshot on receiving hello"
```

---

## Task 14b: Field store in SessionManager for snapshot fidelity

**Files:**
- Modify: `src/collab/session.js`
- Modify: `src/collab/snapshot.test.js`

SessionManager maintains a tiny in-memory `fieldStore` — a `Map` keyed by `"exerciseIndex:field"` with the last-known value — by observing every outgoing and incoming `INPUT` message. The snapshot builder composes its return value with these fields. On receiving a snapshot from the peer, SessionManager re-emits each field as a synthetic `INPUT` event so `useCollabField` instances update without any extra wiring.

- [ ] **Step 1: Add a failing test**

Append to `src/collab/snapshot.test.js`:
```js
describe('snapshot field fidelity', () => {
  it('includes recorded field values in the snapshot sent on hello', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    teacher.setSnapshotBuilder(() => ({ path: '/u/l/0' }));

    const snapshots = [];
    student.on(MSG.SNAPSHOT, (p) => snapshots.push(p));

    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    await Promise.resolve();

    // Teacher records a field value mid-session.
    teacher.broadcast(MSG.INPUT, { exerciseIndex: 0, field: 'value', value: 'hi' });
    await Promise.resolve();

    // The next hello should produce a snapshot containing that field.
    // Simulate a fresh hello from the peer using _debug_sendRaw.
    pair.student.__lastHandle = null; // avoid stale ref in test
    student._debug_sendRaw({ v: 1, type: MSG.HELLO, payload: { role: 'student', clientVersion: '1.0' } });
    await Promise.resolve();

    const latest = snapshots[snapshots.length - 1];
    expect(latest).toBeTruthy();
    expect(latest.path).toBe('/u/l/0');
    expect(latest.fields['0:value']).toBe('hi');
  });

  it('applies incoming snapshot fields as synthetic INPUT events', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();

    const inputs = [];
    student.on(MSG.INPUT, (p) => inputs.push(p));

    teacher._debug_sendRaw({
      v: 1,
      type: MSG.SNAPSHOT,
      payload: { path: '/u/l/0', fields: { '0:value': 'x', '1:selected': 'a' }, submitted: {} },
    });
    await Promise.resolve();

    expect(inputs).toContainEqual({ exerciseIndex: 0, field: 'value', value: 'x' });
    expect(inputs).toContainEqual({ exerciseIndex: 1, field: 'selected', value: 'a' });
  });
});
```

- [ ] **Step 2: Run the test — should fail**

Run: `npm test -- src/collab/snapshot.test.js`
Expected: new test fails (`capturedSnap.fields` is undefined).

- [ ] **Step 3: Extend SessionManager**

In `src/collab/session.js`, add a fieldStore and wire it up.

Near the top of `createSessionManager`:
```js
const fieldStore = new Map(); // "idx:field" -> value
const submittedStore = new Map(); // idx -> { answer, correct }

function recordInput(p) {
  if (!p || typeof p.exerciseIndex !== 'number' || typeof p.field !== 'string') return;
  fieldStore.set(`${p.exerciseIndex}:${p.field}`, p.value);
}
function recordSubmit(p) {
  if (!p || typeof p.exerciseIndex !== 'number') return;
  submittedStore.set(p.exerciseIndex, { answer: p.answer, correct: p.correct });
}
```

In `broadcast(type, payload)`:
```js
broadcast(type, payload) {
  if (type === MSG.INPUT) recordInput(payload);
  if (type === MSG.SUBMIT) recordSubmit(payload);
  if (!handle) return;
  handle.send(makeMessage(type, payload));
},
```

In `onIncoming(m)`, after validation, before typed dispatch:
```js
if (m.type === MSG.INPUT) recordInput(m.payload);
if (m.type === MSG.SUBMIT) recordSubmit(m.payload);
if (m.type === MSG.SNAPSHOT) {
  // Re-emit contained fields/submitted as synthetic events so useCollabField hydrates.
  if (m.payload?.fields && typeof m.payload.fields === 'object') {
    for (const [key, value] of Object.entries(m.payload.fields)) {
      const [idxStr, field] = key.split(':');
      const exerciseIndex = Number(idxStr);
      if (!Number.isNaN(exerciseIndex) && field) {
        emit(MSG.INPUT, { exerciseIndex, field, value });
        fieldStore.set(key, value);
      }
    }
  }
  if (m.payload?.submitted && typeof m.payload.submitted === 'object') {
    for (const [idxStr, entry] of Object.entries(m.payload.submitted)) {
      const exerciseIndex = Number(idxStr);
      if (Number.isNaN(exerciseIndex) || !entry) continue;
      emit(MSG.SUBMIT, { exerciseIndex, ...entry });
      submittedStore.set(exerciseIndex, entry);
    }
  }
  // Still dispatch the snapshot payload itself for any app-level listeners.
}
```

Replace the HELLO branch's snapshot send so it auto-includes the stores:
```js
if (m.type === MSG.HELLO) {
  setStatus('connected');
  if (snapshotBuilder) {
    let extra = {};
    try { extra = snapshotBuilder() || {}; } catch (e) { console.warn('[collab] snapshot builder error', e); }
    const snap = {
      ...extra,
      fields: Object.fromEntries(fieldStore),
      submitted: Object.fromEntries(submittedStore),
    };
    handle.send(makeMessage(MSG.SNAPSHOT, snap));
  }
  return;
}
```

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/collab/`
Expected: all collab tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/collab/session.js src/collab/snapshot.test.js
git commit -m "feat(collab): field store + snapshot hydration so peers catch up on reconnect"
```

---

## Task 15: Top-level SessionProvider wired into the app

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`

Instantiate one SessionManager at the root, wrap `<App/>` in `<SessionProvider>`. Add a top-level effect that detects `?session=CODE` on mount and shows the join prompt, and that auto-rejoins from localStorage on refresh.

- [ ] **Step 1: Read current `src/main.jsx`**

Run: `cat src/main.jsx` — confirm it imports `App` and renders into `#root`.

- [ ] **Step 2: Add the collab singleton**

Create `src/collab/singleton.js`:
```js
import { createSessionManager } from './session.js';
import { createTransport } from './transport.js';

let webrtcTransportPromise = null;
async function getWebrtcTransport() {
  if (!webrtcTransportPromise) {
    webrtcTransportPromise = createTransport('webrtc');
  }
  return webrtcTransportPromise;
}

// Lazy lookup so tests can override.
let mgrInstance = null;
export async function getSessionManager() {
  if (mgrInstance) return mgrInstance;
  const transport = await getWebrtcTransport();
  mgrInstance = createSessionManager({ transport, clientVersion: '1.0' });
  return mgrInstance;
}

export function __resetForTest(m) { mgrInstance = m; }
```

- [ ] **Step 3: Wrap the app tree in SessionProvider**

Modify `src/main.jsx` to:
```js
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { SessionProvider } from './collab/useSession.jsx';
import { getSessionManager } from './collab/singleton.js';

function Root() {
  const [manager, setManager] = useState(null);
  useEffect(() => {
    getSessionManager().then(setManager);
  }, []);
  if (!manager) return null;
  return (
    <SessionProvider manager={manager}>
      <App />
    </SessionProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
);
```

- [ ] **Step 4: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Verify tests still pass**

Run: `npm test`
Expected: all tests pass (components that don't use SessionProvider fall back to the idle stub from `useSession`).

- [ ] **Step 6: Commit**

```bash
git add src/collab/singleton.js src/main.jsx
git commit -m "feat(collab): wire SessionProvider with lazy WebRTC transport singleton"
```

---

## Task 16: Detect `?session=CODE` and show SessionJoinPrompt

**Files:**
- Modify: `src/App.jsx`

When the URL query includes `?session=CODE`, the student sees SessionJoinPrompt. On accept, call `session.join({ roomCode: CODE })`. On decline, strip the param and continue solo.

- [ ] **Step 1: Modify `App.jsx`**

Edit `src/App.jsx`. At the top, alongside the existing imports, add:
```js
import { useEffect, useState } from 'react';
import SessionJoinPrompt from './components/collab/SessionJoinPrompt.jsx';
import SessionBanner from './components/collab/SessionBanner.jsx';
import { useSession } from './collab/useSession.jsx';
import { persistSessionMeta, clearSessionMeta, readSessionMeta } from './collab/recovery.js';
```

Replace the default export with:
```js
export default function App() {
  const session = useSession();
  const [pendingJoinCode, setPendingJoinCode] = useState(null);

  // On mount: check URL for ?session=CODE, or localStorage for saved session.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('session');
    if (urlCode) {
      setPendingJoinCode(urlCode);
      return;
    }
    const saved = readSessionMeta();
    if (saved) {
      // Silent auto-rejoin in background. Banner reflects status.
      if (saved.role === 'teacher') {
        session._manager?.tryReconnect({ as: 'teacher', roomCode: saved.roomCode });
      } else {
        session._manager?.tryReconnect({ as: 'student', roomCode: saved.roomCode });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When status becomes connected, persist meta. When it goes idle/error, clear.
  useEffect(() => {
    if (session.status === 'connected') {
      persistSessionMeta({ roomCode: session.roomCode, role: session.role, transport: 'webrtc' });
    } else if (session.status === 'idle' || session.status === 'error') {
      clearSessionMeta();
    }
  }, [session.status, session.roomCode, session.role]);

  async function acceptJoin() {
    try {
      await session.join({ roomCode: pendingJoinCode });
    } catch (e) {
      console.error('[collab] join failed', e);
    }
    setPendingJoinCode(null);
    // Strip the ?session= param so refresh doesn't re-prompt.
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState({}, '', url.toString());
  }

  function declineJoin() {
    setPendingJoinCode(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState({}, '', url.toString());
  }

  return (
    <>
      <SessionBanner />
      {pendingJoinCode && (
        <SessionJoinPrompt
          roomCode={pendingJoinCode}
          onAccept={acceptJoin}
          onDecline={declineJoin}
        />
      )}
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/:unitId" component={UnitRoute} />
        <Route path="/:unitId/:lessonId" component={LessonRoute} />
        <Route path="/:unitId/:lessonId/:exerciseIdx" component={LessonRoute} />
        <Route><Redirect to="/" /></Route>
      </Switch>
    </>
  );
}
```

- [ ] **Step 2: Run existing tests and build**

Run: `npm test && npm run build`
Expected: tests pass, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat(collab): App handles ?session= join flow and auto-rejoin on mount"
```

---

## Task 17: Mount `SessionHostControls` at the App root

**Files:**
- Modify: `src/App.jsx`

Header isn't visible on the home page, so the teacher's **Start session** control goes into the App root next to SessionBanner — that makes it reachable from any route and avoids cluttering per-page Headers.

- [ ] **Step 1: Edit `src/App.jsx`**

Add the import near the top:
```js
import SessionHostControls from './components/collab/SessionHostControls.jsx';
```

Modify the returned JSX so SessionHostControls sits alongside SessionBanner:
```jsx
return (
  <>
    <SessionBanner />
    <div className="session-toolbar">
      <SessionHostControls />
    </div>
    {pendingJoinCode && (
      <SessionJoinPrompt
        roomCode={pendingJoinCode}
        onAccept={acceptJoin}
        onDecline={declineJoin}
      />
    )}
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/:unitId" component={UnitRoute} />
      <Route path="/:unitId/:lessonId" component={LessonRoute} />
      <Route path="/:unitId/:lessonId/:exerciseIdx" component={LessonRoute} />
      <Route><Redirect to="/" /></Route>
    </Switch>
  </>
);
```

- [ ] **Step 2: Add CSS for the toolbar**

In `src/App.css`, append:
```css
.session-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}
```

- [ ] **Step 3: Verify the app renders**

Run: `npm run build && npm test`
Expected: build succeeds, tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/App.css
git commit -m "feat(collab): mount SessionHostControls at App root"
```

---

## Task 18: Navigation sync via Wouter + snapshot builder/applier

**Files:**
- Create: `src/collab/useNavSync.jsx`
- Modify: `src/App.jsx`

Two-way sync between Wouter's location and the session's `navigate` message. Also installs the snapshot builder (serialize current location) and applier (apply incoming snapshot's `path` via `navigate`).

- [ ] **Step 1: Create the nav-sync hook**

Create `src/collab/useNavSync.jsx`:
```js
import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useSession } from './useSession.jsx';
import { MSG } from './protocol.js';

/**
 * Bi-directional sync between Wouter location and session 'navigate' messages.
 * Also registers a snapshot builder (current path) and applies incoming snapshots.
 */
export function useNavSync() {
  const [location, navigate] = useLocation();
  const session = useSession();
  const applyingRemote = useRef(false);
  const lastSent = useRef(null);

  // Outgoing: broadcast local nav changes when active.
  useEffect(() => {
    if (!session.isActive) return;
    if (applyingRemote.current) return;
    if (lastSent.current === location) return;
    lastSent.current = location;
    session.broadcast(MSG.NAVIGATE, { path: location });
  }, [location, session]);

  // Incoming: apply navigate messages.
  useEffect(() => {
    if (!session._manager) return;
    const unsub = session._manager.on(MSG.NAVIGATE, (p) => {
      if (typeof p?.path !== 'string') return;
      if (p.path === location) return;
      applyingRemote.current = true;
      lastSent.current = p.path;
      navigate(p.path);
      queueMicrotask(() => { applyingRemote.current = false; });
    });
    return unsub;
  }, [session, location, navigate]);

  // Snapshot builder: current path is canonical.
  useEffect(() => {
    if (!session._manager) return;
    session._manager.setSnapshotBuilder(() => ({ path: location }));
  }, [session, location]);

  // Incoming snapshot: apply path.
  useEffect(() => {
    if (!session._manager) return;
    const unsub = session._manager.on(MSG.SNAPSHOT, (p) => {
      if (typeof p?.path === 'string' && p.path !== location) {
        applyingRemote.current = true;
        lastSent.current = p.path;
        navigate(p.path);
        queueMicrotask(() => { applyingRemote.current = false; });
      }
    });
    return unsub;
  }, [session, location, navigate]);
}
```

- [ ] **Step 2: Call `useNavSync` inside App**

In `src/App.jsx`, at the top of the `App` component:
```js
import { useNavSync } from './collab/useNavSync.jsx';

export default function App() {
  useNavSync();
  // ... rest unchanged
```

- [ ] **Step 3: Run existing tests and build**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/collab/useNavSync.jsx src/App.jsx
git commit -m "feat(collab): bi-directional nav sync via Wouter + snapshot path"
```

---

## Task 19: Fix ExerciseRunner's remount bug and integrate CollabScope

**Files:**
- Modify: `src/components/ExerciseRunner.jsx`
- Modify: `src/components/ExerciseRunner.test.jsx`

The existing `key={Math.random()}` causes every render to remount the exercise, wiping local state and `useCollabField` subscriptions. Change to `key={currentIdx}`. Also wrap rendered exercises in `<CollabScope exerciseIndex={currentIdx}>`. Add a `useEffect` to sync `initialIdx` prop changes into `currentIdx` (so remote `navigate` updates advance the runner).

- [ ] **Step 1: Add a failing test asserting no-remount-per-render**

Append to `src/components/ExerciseRunner.test.jsx` (or add if only partial coverage exists):
```js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseRunner from './ExerciseRunner.jsx';

describe('ExerciseRunner remount regression', () => {
  it('does not remount the exercise component on every parent render', () => {
    const exercises = [
      { type: 'multiple-choice', question: 'Q?', options: ['a','b','c','d'], answer: 'a' },
    ];
    const mounts = { count: 0 };
    // Render twice and check that the input keeps focus (proxy for no remount).
    const { rerender } = render(
      <ExerciseRunner exercises={exercises} onComplete={() => {}} />
    );
    const before = screen.getByText('Q?');
    rerender(<ExerciseRunner exercises={exercises} onComplete={() => {}} />);
    const after = screen.getByText('Q?');
    expect(before).toBe(after); // same DOM node — no remount
  });
});
```

- [ ] **Step 2: Run tests — should fail**

Run: `npm test -- src/components/ExerciseRunner.test.jsx`
Expected: the new test fails (old `Math.random()` key causes remount).

- [ ] **Step 3: Fix ExerciseRunner**

Edit `src/components/ExerciseRunner.jsx`:

1. Replace all `key={Math.random()}` occurrences in the switch statement with no explicit key (React will use position). The stable `key={currentIdx}` is applied on `<ExerciseComponent>` in the outer JSX. Example patch: change every `return <MultipleChoice key={Math.random()} ...` to `return <MultipleChoice ...`.

2. Import CollabScope and wrap:
```js
import { CollabScope } from '../collab/useCollabField.js';
```

3. Add a useEffect to sync `initialIdx` → `currentIdx`:
```js
import { useState, useEffect } from 'react';
// ...
useEffect(() => {
  if (initialIdx != null && initialIdx !== currentIdx) {
    setCurrentIdx(initialIdx);
  }
}, [initialIdx]); // intentionally not depending on currentIdx
```

4. Wrap the rendered exercise:
```jsx
<div className={`runner-content ${transitioning ? 'fading' : ''}`}>
  <CollabScope exerciseIndex={currentIdx}>
    <ExerciseComponent key={currentIdx} exercise={current} onAnswer={handleAnswer} />
  </CollabScope>
</div>
```

- [ ] **Step 4: Run tests — should pass**

Run: `npm test -- src/components/ExerciseRunner.test.jsx`
Expected: all ExerciseRunner tests pass, including the new regression.

- [ ] **Step 5: Commit**

```bash
git add src/components/ExerciseRunner.jsx src/components/ExerciseRunner.test.jsx
git commit -m "fix(ExerciseRunner): stable component keys + CollabScope wrap + initialIdx sync"
```

---

## Task 20: Gate `markLesson()` on session active

**Files:**
- Modify: `src/components/LessonPage.jsx`

Suppress `markLesson()` only when `session.isActive` is true. In every other status, student's progress updates normally.

- [ ] **Step 1: Edit LessonPage**

In `src/components/LessonPage.jsx`:

1. Import useSession:
```js
import { useSession } from '../collab/useSession.jsx';
```

2. Inside the component, read the flag:
```js
const session = useSession();
```

3. Change `handleComplete` to:
```js
function handleComplete(score, total, answers) {
  if (!session.isActive) {
    markLesson(lesson.id, score, total);
  }
  setFinalScore(score);
  setFinalTotal(total);
  setFinalAnswers(answers);
  setPhase('score');
}
```

- [ ] **Step 2: Add a gating test using vi.mock**

Create `src/components/LessonPage.test.jsx`:
```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

// Mock markLesson before importing LessonPage so the mock applies.
const markLessonMock = vi.fn();
vi.mock('../hooks/useProgress.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, markLesson: markLessonMock };
});

import LessonPage from './LessonPage.jsx';
import { SessionProvider } from '../collab/useSession.jsx';
import { createSessionManager } from '../collab/session.js';
import { createMemoryTransportPair } from '../collab/transports/memory.js';

const lesson = {
  id: 'test-lesson-gating',
  title: 'Test',
  canDo: 'I can.',
  exercises: [{ type: 'flashcard', cards: [{ front: 'a', back: 'b' }] }],
};
const unit = { color: '#000' };

beforeEach(() => { localStorage.clear(); markLessonMock.mockClear(); });

function harness(mgr) {
  // Drive directly into exercises phase by passing initialIdx=0.
  return render(
    <SessionProvider manager={mgr}>
      <LessonPage lesson={lesson} unit={unit} onBack={() => {}} initialIdx={0} />
    </SessionProvider>
  );
}

describe('LessonPage progress gating', () => {
  it('calls markLesson when no session is connected', async () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    harness(mgr);
    // Advance the single flashcard to completion.
    await act(async () => {
      const btn = screen.getByRole('button', { name: /flip|next|got it|continue/i });
      btn.click();
    });
    // A flashcard exercise auto-scores as correct and advances.
    // Exact button text may differ — adjust the regex if needed after reading Flashcard.jsx.
    expect(markLessonMock).toHaveBeenCalledWith('test-lesson-gating', expect.any(Number), 1);
  });

  it('does NOT call markLesson when session is connected', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    harness(student);
    await act(async () => {
      const btn = screen.getByRole('button', { name: /flip|next|got it|continue/i });
      btn.click();
    });
    expect(markLessonMock).not.toHaveBeenCalled();
  });
});
```

Note: if Flashcard's button label doesn't match the regex, open `Flashcard.jsx` and adjust. The test intent is "complete the single-exercise lesson; verify markLesson call count."

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/LessonPage.jsx src/components/LessonPage.test.jsx
git commit -m "feat(collab): suppress markLesson when session is connected"
```

---

## Task 21: Migrate MultipleChoice to useCollabField

**Files:**
- Modify: `src/components/exercises/MultipleChoice.jsx`
- Modify: `src/components/exercises/MultipleChoice.test.jsx`

- [ ] **Step 1: Read current component**

Run: `cat src/components/exercises/MultipleChoice.jsx` — identify the `useState` call(s) for selection.

- [ ] **Step 2: Add a failing collab test**

Append to `src/components/exercises/MultipleChoice.test.jsx`:
```js
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.js';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

describe('MultipleChoice collab', () => {
  it('broadcasts selection when a session is active', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = { type: 'multiple-choice', question: 'Q?', options: ['a','b','c','d'], answer: 'a' };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <MultipleChoice exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    fireEvent.click(screen.getByText('b'));
    expect(received.some(p => p.field === 'selectedOption' && p.value === 'b')).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test — should fail**

Run: `npm test -- src/components/exercises/MultipleChoice.test.jsx`
Expected: the new test fails (no broadcast).

- [ ] **Step 4: Swap useState → useCollabField**

In `src/components/exercises/MultipleChoice.jsx`, replace the selection `useState` with:
```js
import { useCollabField } from '../../collab/useCollabField.js';
// ...
const [selectedOption, setSelectedOption] = useCollabField('selectedOption', null);
```

(If the file names the variable differently, keep the existing name but switch the hook.)

- [ ] **Step 5: Run tests — should pass**

Run: `npm test -- src/components/exercises/MultipleChoice.test.jsx`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/exercises/MultipleChoice.jsx src/components/exercises/MultipleChoice.test.jsx
git commit -m "feat(MultipleChoice): sync selection via useCollabField"
```

---

## Task 22: Migrate FillBlank

**Files:**
- Modify: `src/components/exercises/FillBlank.jsx`
- Modify: `src/components/exercises/FillBlank.test.jsx`

- [ ] **Step 1: Read current component**

Run: `cat src/components/exercises/FillBlank.jsx` — identify the `useState` for `value`.

- [ ] **Step 2: Add a failing collab test**

Append to `src/components/exercises/FillBlank.test.jsx`:
```js
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.js';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

describe('FillBlank collab', () => {
  it('broadcasts typed value', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = { type: 'fill-blank', template: 'The ___ runs.', wordBank: ['cat','dog','pig','rat'], answer: 'dog' };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <FillBlank exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    fireEvent.click(screen.getByText('dog'));
    expect(received.some(p => p.field === 'value' && p.value === 'dog')).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test — should fail**

Run: `npm test -- src/components/exercises/FillBlank.test.jsx`
Expected: new test fails.

- [ ] **Step 4: Swap useState → useCollabField for `value`**

```js
import { useCollabField } from '../../collab/useCollabField.js';
const [value, setValue] = useCollabField('value', '');
```

(Match the exact variable names in the existing file.)

- [ ] **Step 5: Run tests — should pass**

Run: `npm test -- src/components/exercises/FillBlank.test.jsx`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/exercises/FillBlank.jsx src/components/exercises/FillBlank.test.jsx
git commit -m "feat(FillBlank): sync answer value via useCollabField"
```

---

## Task 23: Migrate TrueFalse, WordOrder, Matching

**Files:**
- Modify: `src/components/exercises/TrueFalse.jsx` + test
- Modify: `src/components/exercises/WordOrder.jsx` + test
- Modify: `src/components/exercises/Matching.jsx` + test

Repeat the migration pattern. Each exercise has its own field names.

- [ ] **Step 1: TrueFalse**

Read `src/components/exercises/TrueFalse.jsx`. Replace the selection `useState` with:
```js
import { useCollabField } from '../../collab/useCollabField.js';
const [selected, setSelected] = useCollabField('selected', null);
```

Append a broadcast test to `TrueFalse.test.jsx` analogous to the MultipleChoice one, using field name `'selected'`.

- [ ] **Step 2: WordOrder**

Read `src/components/exercises/WordOrder.jsx`. Replace the assembled-array `useState` with:
```js
const [assembled, setAssembled] = useCollabField('assembled', []);
```

Also check whether there's a "pool" or other local state — leave non-collab state as `useState`.

Append a broadcast test to `WordOrder.test.jsx` with field name `'assembled'` and an array value.

- [ ] **Step 3: Matching**

Read `src/components/exercises/Matching.jsx`. It has two stateful pieces: `matched` and `selectedLeft`. Migrate both:
```js
const [matched, setMatched] = useCollabField('matched', []);
const [selectedLeft, setSelectedLeft] = useCollabField('selectedLeft', null);
```

Append a broadcast test to `Matching.test.jsx` — clicking a left item should broadcast `field: 'selectedLeft'`.

- [ ] **Step 4: Run all exercise tests**

Run: `npm test -- src/components/exercises/`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/exercises/TrueFalse.jsx src/components/exercises/TrueFalse.test.jsx \
        src/components/exercises/WordOrder.jsx src/components/exercises/WordOrder.test.jsx \
        src/components/exercises/Matching.jsx src/components/exercises/Matching.test.jsx
git commit -m "feat: sync TrueFalse/WordOrder/Matching state via useCollabField"
```

---

## Task 24: Migrate GrammarTable, Flashcard, ReadingComprehension

**Files:**
- Modify: `src/components/exercises/GrammarTable.jsx` + test
- Modify: `src/components/exercises/Flashcard.jsx` (no existing test file — create if desired)
- Modify: `src/components/exercises/ReadingComprehension.jsx` + test

- [ ] **Step 1: GrammarTable**

Read `src/components/exercises/GrammarTable.jsx`. The cell-values object becomes collab-synced:
```js
const [cellValues, setCellValues] = useCollabField('cellValues', {});
```

Append a broadcast test to `GrammarTable.test.jsx` — typing in a cell should broadcast `field: 'cellValues'` with an object value.

- [ ] **Step 2: Flashcard**

Read `src/components/exercises/Flashcard.jsx`. Replace the current card-index `useState` with:
```js
const [flippedIndex, setFlippedIndex] = useCollabField('flippedIndex', 0);
```

(Create a minimal `Flashcard.test.jsx` only if you want coverage; not required since Flashcard has no scoring logic.)

- [ ] **Step 3: ReadingComprehension**

Read `src/components/exercises/ReadingComprehension.jsx`. It has per-question selected options. If it's a single array, migrate that:
```js
const [selectedOptions, setSelectedOptions] = useCollabField('selectedOptions', []);
```

If it uses a different shape, match the existing shape.

Append a broadcast test to `ReadingComprehension.test.jsx`.

- [ ] **Step 4: Run all exercise tests**

Run: `npm test -- src/components/exercises/`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/exercises/GrammarTable.jsx src/components/exercises/GrammarTable.test.jsx \
        src/components/exercises/Flashcard.jsx \
        src/components/exercises/ReadingComprehension.jsx src/components/exercises/ReadingComprehension.test.jsx
git commit -m "feat: sync GrammarTable/Flashcard/ReadingComprehension state via useCollabField"
```

---

## Task 25: Styles for session UI (minimal CSS)

**Files:**
- Modify: `src/App.css`

Add CSS for `.session-banner`, `.session-host-panel`, `.session-url`, `.session-join-overlay`, `.session-join-card`, `.session-join-actions`. Keep visual weight low — the banner is a thin strip at the top.

- [ ] **Step 1: Append to `src/App.css`**

```css
.session-banner {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}
.session-banner.connecting { background: #fff3cd; color: #8a6d3b; }
.session-banner.connected  { background: #d4edda; color: #155724; }
.session-banner.peer-gone  { background: #fff3cd; color: #8a6d3b; }
.session-banner.error      { background: #e2e3e5; color: #383d41; }

.session-host-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  background: #f7f7f8;
  border: 1px solid #e3e3e3;
  border-radius: 6px;
  font-size: 0.85rem;
}
.session-url {
  font-family: monospace;
  word-break: break-all;
  background: white;
  padding: 6px 8px;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
}

.session-join-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
.session-join-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 420px;
  width: 90%;
}
.session-join-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
.session-join-actions .primary {
  background: #2980b9;
  color: white;
}
```

- [ ] **Step 2: Visual verification**

Run: `npm run dev`
Open `http://localhost:5173`. Verify:
- App loads normally (no banner when idle).
- Clicking "Start session" shows a panel with the URL.
- The banner appears as the connection status changes.

Stop the dev server when done.

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "style(collab): add CSS for SessionBanner, host panel, and join dialog"
```

---

## Task 26: Manual end-to-end smoke test + checklist

**Files:** no code changes — manual verification of the whole feature.

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`

- [ ] **Step 2: Teacher flow (first window)**

- Open `http://localhost:5173/english-app/` in one browser window.
- Click **Start session** in the header.
- Copy the URL shown.

- [ ] **Step 3: Student flow (second window, incognito)**

- Open the copied URL in an incognito window.
- Verify the **Join tutoring session?** dialog appears with the room code.
- Click **Join**. Confirm both sides' banners say "Live with teacher" (green).

- [ ] **Step 4: Navigation sync**

- Teacher clicks into Unit 1. Confirm student's URL and view match.
- Teacher opens a lesson and clicks Start. Student's view should advance too.

- [ ] **Step 5: Exercise sync (one of each type)**

For each exercise type — MC, FillBlank, TrueFalse, WordOrder, Matching, GrammarTable, Flashcard, ReadingComprehension — verify:
- Student's interaction (click / type) appears on teacher's screen instantly.
- Teacher's interaction appears on student's screen.
- Submitting still advances on both sides.

- [ ] **Step 6: Progress gating**

- Before the session started, note the student's streak/progress state.
- Complete a lesson while in the session.
- Confirm the student's localStorage `ep1_progress` was NOT updated for that lesson.
- End the session, complete the same lesson solo, verify progress IS recorded this time.

- [ ] **Step 7: Refresh recovery**

- With a session active, refresh the student's window.
- Confirm the page reloads, banner briefly shows "Connecting…", then back to "Live with teacher".
- Exercise state is restored on the student's side before the peer fully reconnects.

- [ ] **Step 8: Peer-gone behavior**

- Close the teacher's window (graceful end: click End session).
- Student's banner turns to "Session ended — practicing solo" and auto-dismisses.
- Close the teacher's window abruptly (no End session click).
- Student's banner shows "Waiting for teacher — you can keep practicing" for ~30s, then disappears.

- [ ] **Step 9: Solo practice still works**

- With no session at all, the app should behave exactly as before.
- Running `git stash` or `git checkout main` on the code and running `npm test` should behave identically.

- [ ] **Step 10: Record findings**

If any step fails, open an issue in the plan for follow-up. No new commit unless code changes.

---

## Task 27: Remove stale README claim about "no router"

**Files:**
- Modify: `README.md`

The README's line "There is no router" is outdated — the app uses Wouter.

- [ ] **Step 1: Correct the README**

In `README.md`, locate the "## Navigation" section. Replace:
```markdown
There is no router. `App.jsx` holds `{ view, unitId, lessonId }` state:
```
with:
```markdown
Navigation is URL-driven via [Wouter](https://github.com/molefrog/wouter). `App.jsx` defines routes:

```
/                               → home (unit grid)
/:unitId                        → unit page
/:unitId/:lessonId              → lesson intro
/:unitId/:lessonId/:exerciseIdx → lesson, exercise N
```

These URLs are also how the realtime tutoring feature syncs navigation between teacher and student.
```

Remove the obsolete ASCII diagram that follows.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: correct README — app uses Wouter routing"
```

---

## Done

After Task 27, the feature is complete end-to-end: pluggable transport, PeerJS-based WebRTC, SessionManager, useCollabField for every exercise, Wouter-driven nav sync, session recovery, reconnect/backoff, non-blocking UI, and documented behavior.

The `Transport` interface is the seam that makes approach B (PartyKit) or C (self-hosted WebSocket) a future drop-in: write one file, update the factory, and nothing else needs to change.
