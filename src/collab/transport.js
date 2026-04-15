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
