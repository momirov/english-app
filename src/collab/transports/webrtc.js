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
