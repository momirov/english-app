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
  let peerGoneTimer = null;
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
      const wasConnecting = status === 'connecting';
      // Peer has arrived. Move to connected.
      setStatus('connected');
      // Reply with our own HELLO if this is the first time (peer may have registered
      // onMessage late and missed our initial HELLO from onPeerState).
      if (wasConnecting && handle) {
        handle.send(makeMessage(MSG.HELLO, { role, clientVersion }));
      }
      // Ask subscribers (recovery hook) to build and send a snapshot.
      for (const fn of snapshotSubs) fn();
      return;
    }
    if (m.type === MSG.BYE) {
      // Close the transport handle but stay in peer-gone with a 30s timer.
      if (handle) { try { handle.close(); } catch {} handle = null; }
      role = null;
      roomCode = null;
      setStatus('peer-gone');
      if (peerGoneTimer) { clearTimeout(peerGoneTimer); }
      peerGoneTimer = setTimeout(() => {
        peerGoneTimer = null;
        teardown('idle');
      }, 30_000);
      return;
    }
    emit(m.type, m.payload);
  }

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

  async function attach(h, assignedRole, assignedCode) {
    handle = h;
    role = assignedRole;
    roomCode = assignedCode;
    setStatus('connecting');
    handle.onMessage(onIncoming);
    handle.onPeerState(onPeerState);
  }

  function teardown(finalStatus) {
    if (peerGoneTimer) { clearTimeout(peerGoneTimer); peerGoneTimer = null; }
    if (handle) {
      try { handle.close(); } catch {}
      handle = null;
    }
    role = null;
    roomCode = null;
    setStatus(finalStatus);
  }

  const api = {
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
    async tryReconnect({ as, roomCode: code, maxAttempts = 5, backoffMs = (i) => Math.min(500 * 2 ** i, 8000) }) {
      for (let i = 0; i < maxAttempts; i++) {
        setStatus('connecting');
        try {
          if (as === 'teacher') await api.start({ as, roomCode: code });
          else await api.join({ roomCode: code });
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
    // Used by recovery hook in Task 14.
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
  return api;
}
