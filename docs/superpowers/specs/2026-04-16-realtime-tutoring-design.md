# Realtime Tutoring — Design Spec

**Date:** 2026-04-16
**Scope:** 1:1 teacher-student live collaboration over the existing exercise flow
**Status:** Approved

---

## Problem

The app is currently solo-only. We want a teacher to be able to run a live 1:1 tutoring session with a student: both people see the same exercise, both can interact, the teacher can pick exercises, reveal answers, and mark things. The app must keep working fully solo when no session is active.

---

## Decisions

| Question | Decision |
|---|---|
| Collaboration model | 1:1 teacher ↔ student, shared interactive mirror |
| Teacher role | Co-pilot — can type, click, reveal, mark, advance |
| Conflict resolution | Last-write-wins, no locks or cursors |
| Session initiation | Teacher creates room → shareable URL → student clicks link |
| Identity / auth | None. Anonymous, ephemeral rooms keyed by a friendly short code |
| Transport (initial) | WebRTC peer-to-peer via PeerJS (no backend) |
| Transport future | Pluggable — same interface for PartyKit / self-hosted WebSocket later |
| Student progress during session | `markLesson()` is suppressed **only while** `status === 'connected'` |
| Solo practice | Always works; UI never blocks during `peer-gone` / `connecting` |
| Refresh UX | Session recovery from localStorage (Version 3 from brainstorm) |
| Out of scope | Voice/video, chat, recording, accounts, teacher dashboard, multi-student rooms, peer cursors |

---

## Architecture

Four layers. Only the bottom layer changes when we swap transports.

```
┌─────────────────────────────────┐
│  UI (App, LessonPage, Banner)   │
├─────────────────────────────────┤
│  Session (role, peers, state)   │  framework-agnostic application layer
├─────────────────────────────────┤
│  Protocol (typed messages)      │  JSON schema: input, submit, navigate …
├─────────────────────────────────┤
│  Transport interface            │  connect / send / onMessage / peerState
├─────────────────────────────────┤
│  webrtc.js │ partykit.js │ ws.js│  only this file changes per approach
└─────────────────────────────────┘
```

### File layout (new)

```
src/
  collab/
    transport.js            transport interface (JSDoc types)
    transports/
      webrtc.js             PeerJS-based implementation (approach A)
    protocol.js             message type constants + validators
    session.js              SessionManager: wires transport ↔ protocol ↔ app state
    useSession.jsx          React context + hook
    useCollabField.js       useState-compatible hook that syncs over the wire
    recovery.js             throttled localStorage snapshot of session state
  components/collab/
    SessionHostControls.jsx teacher's "Start session" button + room URL
    SessionJoinPrompt.jsx   student's "Join session?" dialog
    SessionBanner.jsx       persistent connection indicator
```

---

## Initiation and session lifecycle

1. **Teacher** clicks **Start session** in the header → `transport.createRoom()` → gets a short code like `PLUM-FOX-73` (generated from a 3-word dictionary and registered as the PeerJS id) → UI displays `https://…/?session=PLUM-FOX-73`.
2. Teacher sends the URL to the student out-of-band (WhatsApp, email, etc.).
3. **Student** opens the URL → `App.jsx` reads `?session=…` on mount → shows `SessionJoinPrompt` → on accept, `transport.joinRoom(code)` → connection established.
4. Both sides persist `{ roomCode, role, transport: 'webrtc' }` to `localStorage.ep1_session`. On any subsequent mount, if that key exists, `SessionManager` auto-attempts rejoin in the background; the `SessionBanner` reflects the current `status` — no modal or interstitial.
5. Either side clicks **End session** → graceful `bye` → both clear `ep1_session` and `ep1_session_state`.

---

## Transport interface

Every transport implements the same contract. `SessionManager` touches only this.

```js
// src/collab/transport.js
/**
 * @typedef {Object} Transport
 * @property {() => Promise<RoomHandle>} createRoom   // teacher side
 * @property {(roomCode: string) => Promise<RoomHandle>} joinRoom // student side
 */

/**
 * @typedef {Object} RoomHandle
 * @property {string} roomCode
 * @property {'teacher'|'student'} role
 * @property {(msg: object) => void} send
 * @property {(fn: (msg: object) => void) => () => void} onMessage
 * @property {(fn: (state: 'connected'|'disconnected') => void) => () => void} onPeerState
 * @property {() => void} close
 */

export function createTransport(kind /* 'webrtc' | 'partykit' | 'websocket' */) { … }
```

### WebRTC implementation (PeerJS)

- PeerJS provides a free public broker for signaling. Teacher constructs `new Peer(friendlyCode)`, registering the friendly code as its id. Student calls `peer.connect(friendlyCode)`.
- Friendly code dictionary: 3 short words from a curated list (~200 words each, low ambiguity). Collisions on the PeerJS broker surface as an error; we retry with a different code on create.
- `DataConnection` carries JSON messages both ways. `onMessage` wraps its `data` event; `onPeerState` wraps `open` / `close` / `error`.
- STUN: PeerJS default (Google's public STUN). **No TURN** — we accept ~10–20% NAT-failure rate as a known limit of approach A.

The only new third-party dependency: `peerjs` (MIT, ~50 kB gzipped).

---

## Protocol

All messages are shaped `{ v: 1, type, payload }`. `v` is a protocol version. Mismatch → both sides show "App version mismatch — please refresh" and stop applying messages.

```js
// lifecycle
{ type: 'hello',         payload: { role, clientVersion } }
{ type: 'bye',           payload: {} }

// catch-up (sent in response to hello)
{ type: 'snapshot',      payload: {
    view, unitId, lessonId, exerciseIndex,
    fields: { /* "exerciseIndex:field" → value */ },
    submitted: { /* exerciseIndex → { answer, correct } */ },
} }

// navigation
{ type: 'navigate',      payload: { view, unitId?, lessonId? } }
{ type: 'next-exercise', payload: { exerciseIndex } }

// exercise interaction — last-write-wins
{ type: 'input',         payload: { exerciseIndex, field, value } }
{ type: 'submit',        payload: { exerciseIndex, answer, correct } }
{ type: 'reveal',        payload: { exerciseIndex } }
{ type: 'mark',          payload: { exerciseIndex, correct } }
```

`protocol.js` exports these constants, `isValidMessage(m)`, and `makeMessage(type, payload)`. Messages that fail validation are dropped with a console warning — we never crash on malformed peer input.

---

## Session state

`SessionManager` holds:

```js
{
  status: 'idle' | 'connecting' | 'connected' | 'peer-gone' | 'error',
  role: 'teacher' | 'student' | null,
  roomCode: string | null,
  transport: 'webrtc',
  peerConnectedAt: number | null,
  lastError: string | null,
}
```

It exposes:
- `start({ as: 'teacher' })` / `join({ as: 'student', roomCode })` / `end()`
- `broadcast(type, payload)` — used by `useCollabField` and navigation code
- `on(type, handler)` — subscribe to incoming messages by type
- `isActive` (boolean getter: `status === 'connected'`)

Exposed to React via `useSession.jsx` context. Components that consume session events call `useCollabField` or read from the context directly.

### Progress gating

`useProgress.markLesson()` is guarded at its callsite in `ExerciseRunner` / `LessonPage`: skip the call iff `session.status === 'connected'`. All other statuses (`idle`, `connecting`, `peer-gone`, `error`) let progress and streak update normally. This is the concrete rule for "student can practice solo even mid-session".

---

## Refactor of exercise components

Shared mirror + last-write-wins means every exercise's working state must flow over the wire. We do this without making exercises session-aware, via a single hook.

### `useCollabField` — the seam

```js
// src/collab/useCollabField.js
// Drop-in replacement for useState, keyed by (exerciseIndex, field).
// Behaves exactly like useState when no session is active.
// When a session is active:
//   - broadcasts an 'input' message on every set
//   - subscribes to incoming 'input' messages for the same (exerciseIndex, field)
//     and overwrites local state (last-write-wins)
const [value, setValue] = useCollabField('selectedOption', null);
```

### Per-component migration

| Component | Fields to migrate |
|---|---|
| MultipleChoice | `selectedOption` |
| FillBlank | `value` |
| TrueFalse | `selected` |
| WordOrder | `assembled` |
| Matching | `matched`, `selectedLeft` |
| GrammarTable | `cellValues` (object) |
| Flashcard | `flippedIndex` |
| ReadingComprehension | `selectedOption` (per question) |

Each change is mechanical: swap `useState` → `useCollabField`, no other logic touched.

### ExerciseRunner, LessonPage, App

- `ExerciseRunner` broadcasts `next-exercise` on advance, applies incoming `next-exercise`, and gates `markLesson` on `!session.isActive`.
- `LessonPage` broadcasts `navigate` for intro → run → score transitions and applies incoming.
- `App.jsx` broadcasts `navigate` for home/unit/lesson selection and applies incoming.

Proportional scoring (recent change in GrammarTable / ReadingComprehension, commit `a1d9631`) is computed locally on each side from the shared field state — no sync needed.

---

## Session recovery (Version 3 from brainstorm)

`recovery.js` keeps a compact JSON snapshot of current session state in `localStorage.ep1_session_state`, written by `SessionManager` on any state change, throttled to ~1/sec. Shape matches the `snapshot` protocol payload.

**On mount:**
1. If `ep1_session` exists, `SessionManager` begins auto-rejoin (see Error handling below).
2. If `ep1_session_state` also exists, hydrate local state immediately. Student sees their previous exercise state *before* the peer reconnects.
3. Once peer reconnects, the usual `hello` → `snapshot` exchange runs. Last-write-wins: if the peer's state is newer, it overwrites; otherwise the recovered state survives.

**Cleared on:** `end()`, 5 failed reconnect attempts, or `bye` from peer.

---

## Error handling and reconnect

- **Auto-rejoin on refresh.** If `ep1_session` exists on mount, `SessionManager` retries connect with exponential backoff (500ms → 8s, up to 5 attempts). Successful reconnect is silent. Failure clears `ep1_session` + `ep1_session_state`, sets `status: 'error'`, surfaces a non-blocking banner with **Retry** / **End session**.
- **Peer disconnect during session.** `onPeerState('disconnected')` → status = `'peer-gone'`. Hold for 30 seconds with "Waiting for teacher — you can keep practicing" banner. Reconnect within 30s → resume. After 30s → clean local end.
- **Graceful bye.** Received `bye` → end immediately, no 30s hold.
- **Invalid / expired room code.** `joinRoom()` rejects → "This session link is no longer active — ask for a new one." No retry.
- **Protocol version skew.** `hello.v !== local v` → both sides display "App version mismatch — please refresh." No further messages applied.

### SessionBanner states (non-blocking)

| Session status | Banner |
|---|---|
| `idle` | hidden |
| `connecting` | amber — "◌ Connecting…" |
| `connected` | green — "● Live with teacher" |
| `peer-gone` | amber — "◌ Waiting for teacher — you can keep practicing" |
| `error` | grey — "✕ Session ended — practicing solo" (auto-dismiss 5s) |

The banner is informational only. Exercise content is never modal-blocked.

---

## Testing

- **Unit:** `protocol.js` validator round-trips every message shape. `SessionManager` state-transition table tested against a stub transport that implements the same `RoomHandle` interface with no real network.
- **Integration:** a `MemoryTransport` connects two `SessionManager`s in-process. Drive a full lesson through it, assert both sides converge on every exercise type.
- **Abstraction smoke test:** the same `SessionManager` + UI code must pass end-to-end with `MemoryTransport` substituted for `webrtc.js`. This proves the seam is real before we write the PartyKit transport later.
- **Manual:** two browser windows (one incognito), open the join URL in the second, run through each exercise type, test refresh on each side, test mid-lesson disconnect.

---

## Non-goals

- No voice / video / chat (teacher and student are assumed to be on a separate call).
- No session recording or playback.
- No accounts, no teacher dashboard, no saved student list.
- No multi-student rooms.
- No peer cursors or coloured per-input highlights (logged as v2).
- No transport B or C implementation — only the interface is designed; B/C land in later specs that reuse the same `Transport` contract.
- No TURN server. WebRTC failures on restrictive NATs are an accepted limit of approach A.
