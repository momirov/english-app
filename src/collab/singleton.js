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
