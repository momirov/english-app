import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Matching from './Matching';
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

describe('Matching collab', () => {
  it('broadcasts selectedLeft when a left item is clicked', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = { type: 'matching', pairs: [
      { left: 'cat', right: 'an animal' },
      { left: 'book', right: 'you read it' },
    ] };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <Matching exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    fireEvent.click(screen.getByText('cat'));
    await new Promise(r => setTimeout(r, 10));
    expect(received.some(p => p.field === 'selectedLeft' && p.value === 'cat')).toBe(true);
  });
});
