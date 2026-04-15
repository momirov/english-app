import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FillBlank from './FillBlank';
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

const exercise = {
  type: 'fill-blank',
  template: 'She ___ notes in every lesson.',
  wordBank: ['makes', 'asks', 'reads', 'spells'],
  answer: 'makes',
};

describe('FillBlank', () => {
  it('renders the sentence template and word bank', () => {
    render(<FillBlank exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByText(/notes in every lesson/)).toBeInTheDocument();
    expect(screen.getByText('makes')).toBeInTheDocument();
  });

  it('shows no "Got it" button on correct answer', async () => {
    const user = userEvent.setup();
    render(<FillBlank exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('makes'));
    expect(screen.queryByRole('button', { name: 'Got it' })).not.toBeInTheDocument();
  });

  it('shows "Got it" button on wrong answer', async () => {
    const user = userEvent.setup();
    render(<FillBlank exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('asks'));
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
  });

  it('calls onAnswer(false) when "Got it" is clicked', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<FillBlank exercise={exercise} onAnswer={onAnswer} />);
    await user.click(screen.getByText('asks'));
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onAnswer).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('disables word bank buttons after selection', async () => {
    const user = userEvent.setup();
    render(<FillBlank exercise={exercise} onAnswer={vi.fn()} />);
    const buttons = screen.getAllByRole('button').filter(b => b.className.includes('word-chip'));
    // Click first button
    await user.click(buttons[0]);
    // After selection, all word-chip buttons are disabled
    screen.getAllByRole('button').filter(b => b.className.includes('word-chip')).forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });
});

describe('FillBlank collab', () => {
  it('broadcasts chosen value when a session is active', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = { type: 'fill-blank', template: 'The ___ runs.', wordBank: ['cat','dog','pig','rat'], answer: 'dog' };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <FillBlank exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    fireEvent.click(screen.getByText('dog'));
    await new Promise(r => setTimeout(r, 10));
    expect(received.some(p => p.field === 'chosen' && p.value === 'dog')).toBe(true);
  });
});
