import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SessionHostControls from './SessionHostControls.jsx';
import { SessionProvider } from '../../collab/useSession.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';

describe('SessionHostControls', () => {
  it('shows Start session button when idle', () => {
    const pair = createMemoryTransportPair('IGNORED');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(<SessionProvider manager={mgr}><SessionHostControls /></SessionProvider>);
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
  });

  it('starts session and shows shareable URL after click', async () => {
    const pair = createMemoryTransportPair('IGNORED');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    render(<SessionProvider manager={mgr}><SessionHostControls /></SessionProvider>);
    fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    await waitFor(() => {
      expect(screen.getByTestId('session-url')).toBeInTheDocument();
    });
    const text = screen.getByTestId('session-url').textContent;
    // The URL should include a ?session= param with a valid WORD-WORD-NN code.
    expect(text).toMatch(/\?session=[A-Z]+-[A-Z]+-\d{2}$/);
  });
});
