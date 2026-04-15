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
