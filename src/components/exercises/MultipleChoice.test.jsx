import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MultipleChoice from './MultipleChoice';
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

const exercise = {
  type: 'multiple-choice',
  question: 'What is the capital of France?',
  options: ['London', 'Paris', 'Rome', 'Berlin'],
  answer: 'Paris',
};

describe('MultipleChoice', () => {
  it('shows the question and all options', () => {
    render(<MultipleChoice exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    ['London', 'Paris', 'Rome', 'Berlin'].forEach((opt) => {
      expect(screen.getByText(opt)).toBeInTheDocument();
    });
  });

  it('shows correct feedback and NO "Got it" button on correct answer', async () => {
    const user = userEvent.setup();
    render(<MultipleChoice exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('Paris'));
    expect(screen.getByText('✓ Correct!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Got it' })).not.toBeInTheDocument();
  });

  it('shows wrong feedback AND a "Got it" button on wrong answer', async () => {
    const user = userEvent.setup();
    render(<MultipleChoice exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('London'));
    expect(screen.getByText('✗ The answer is: Paris')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
  });

  it('calls onAnswer(false) when "Got it" is clicked after wrong answer', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<MultipleChoice exercise={exercise} onAnswer={onAnswer} />);
    await user.click(screen.getByText('London'));
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onAnswer).toHaveBeenCalledWith(false, expect.objectContaining({ correctAnswer: 'Paris' }));
  });

  it('disables answer buttons after selection', async () => {
    const user = userEvent.setup();
    render(<MultipleChoice exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('London'));
    ['London', 'Paris', 'Rome', 'Berlin'].forEach((opt) => {
      expect(screen.getByText(opt)).toBeDisabled();
    });
  });
});

describe('MultipleChoice collab', () => {
  it('broadcasts selection when a session is active', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = { type: 'multiple-choice', question: 'Q?', options: ['a','b','c','d'], answer: 'a' };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <MultipleChoice exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    fireEvent.click(screen.getByText('b'));
    // Wait a tick for effects + broadcast.
    await new Promise(r => setTimeout(r, 10));
    expect(received.some(p => p.field === 'selected' && p.value === 'b')).toBe(true);
  });
});
