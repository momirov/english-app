import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SessionProvider, useSession } from './useSession.jsx';
import { createSessionManager } from './session.js';
import { createMemoryTransportPair } from './transports/memory.js';

function Probe() {
  const s = useSession();
  return (
    <div>
      <span data-testid="status">{s.status}</span>
      <span data-testid="active">{String(s.isActive)}</span>
    </div>
  );
}

describe('useSession', () => {
  it('exposes initial idle status', () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(
      <SessionProvider manager={mgr}>
        <Probe />
      </SessionProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(screen.getByTestId('active').textContent).toBe('false');
  });

  it('re-renders when status changes', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    render(
      <SessionProvider manager={teacher}>
        <Probe />
      </SessionProvider>
    );
    await act(async () => {
      await teacher.start({ as: 'teacher', roomCode: 'R' });
      await student.join({ roomCode: 'R' });
      await Promise.resolve();
    });
    expect(screen.getByTestId('status').textContent).toBe('connected');
    expect(screen.getByTestId('active').textContent).toBe('true');
  });
});
