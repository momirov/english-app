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
