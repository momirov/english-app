import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Flashcard from './Flashcard.jsx';
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

describe('Flashcard collab', () => {
  it('broadcasts flipped when the card is clicked to reveal', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = {
      type: 'flashcard',
      cards: [
        { front: 'hello', back: 'greeting' },
        { front: 'bye', back: 'farewell' },
      ],
    };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <Flashcard exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    // Flashcard click area — the .flashcard div contains the card text.
    fireEvent.click(screen.getByText('hello'));
    await new Promise(r => setTimeout(r, 10));
    expect(received.some(p => p.field === 'flipped' && p.value === true)).toBe(true);
  });
});
