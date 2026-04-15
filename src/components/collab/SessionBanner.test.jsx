import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SessionBanner from './SessionBanner.jsx';
import { SessionProvider } from '../../collab/useSession.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';

describe('SessionBanner', () => {
  it('is hidden when idle', () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(<SessionProvider manager={mgr}><SessionBanner /></SessionProvider>);
    expect(screen.queryByTestId('session-banner')).toBeNull();
  });

  it('shows connecting', async () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(<SessionProvider manager={mgr}><SessionBanner /></SessionProvider>);
    await act(async () => { mgr.start({ as: 'teacher', roomCode: 'R' }); });
    expect(screen.getByTestId('session-banner').textContent).toMatch(/connecting/i);
  });

  it('shows connected green text once peer joins', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    render(<SessionProvider manager={teacher}><SessionBanner /></SessionProvider>);
    await act(async () => {
      await teacher.start({ as: 'teacher', roomCode: 'R' });
      await student.join({ roomCode: 'R' });
      await Promise.resolve();
    });
    expect(screen.getByTestId('session-banner').textContent).toMatch(/live/i);
    expect(screen.getByTestId('session-banner').className).toMatch(/connected/);
  });

  it('shows peer-gone amber with practice-can-continue copy', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    render(<SessionProvider manager={teacher}><SessionBanner /></SessionProvider>);
    await act(async () => {
      await teacher.start({ as: 'teacher', roomCode: 'R' });
      await student.join({ roomCode: 'R' });
      await Promise.resolve();
      student.end();
      await Promise.resolve();
    });
    expect(screen.getByTestId('session-banner').textContent).toMatch(/keep practicing/i);
  });
});
