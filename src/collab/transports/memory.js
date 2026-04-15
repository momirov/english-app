// In-process paired transport for tests.
// Usage:
//   const { teacher, student } = createMemoryTransportPair('ROOM');
//   const t = await teacher.createRoom();
//   const s = await student.joinRoom('ROOM');

function makeHandle(roomCode, role, otherHandleRef) {
  const messageSubs = new Set();
  const peerSubs = new Set();
  let closed = false;
  let lastPeerState = null; // tracks last emitted peer state for late subscribers
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
      // Replay last peer state to late subscribers (e.g. session attach after joinRoom).
      if (lastPeerState !== null) fn(lastPeerState);
      return () => peerSubs.delete(fn);
    },
    close() {
      if (closed) return;
      closed = true;
      handle.__closed = true;
      const other = otherHandleRef.current;
      if (other && !other.__closed) {
        for (const fn of other.__peerSubs) fn('disconnected');
        other.__lastPeerState = 'disconnected';
      }
    },
    __messageSubs: messageSubs,
    __peerSubs: peerSubs,
    __closed: closed,
    get __lastPeerState() { return lastPeerState; },
    set __lastPeerState(v) { lastPeerState = v; },
  };
  return handle;
}

export function createMemoryTransportPair(roomCode) {
  const teacherRef = { current: null };
  const studentRef = { current: null };

  const teacher = {
    async createRoom(code) {
      const finalCode = code || roomCode;
      const h = makeHandle(finalCode, 'teacher', studentRef);
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
        const teacherH = teacherRef.current;
        for (const fn of teacherH.__peerSubs) fn('connected');
        teacherH.__lastPeerState = 'connected';
        for (const fn of h.__peerSubs) fn('connected');
        h.__lastPeerState = 'connected';
      }
      return h;
    },
  };

  return { teacher, student };
}
