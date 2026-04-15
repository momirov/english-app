import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SessionProvider } from './useSession.jsx';
import { CollabScope, useCollabField } from './useCollabField.jsx';
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
