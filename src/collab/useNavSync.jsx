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
