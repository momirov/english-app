import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TrueFalse from './TrueFalse';
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

const exercise = {
  type: 'true-false',
  statement: 'The sun rises in the east.',
  answer: true,
};

describe('TrueFalse', () => {
  it('renders the statement and True/False buttons', () => {
    render(<TrueFalse exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByText('The sun rises in the east.')).toBeInTheDocument();
    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
  });

  it('shows no "Got it" button on correct answer', async () => {
    const user = userEvent.setup();
    render(<TrueFalse exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('True'));
    expect(screen.queryByRole('button', { name: 'Got it' })).not.toBeInTheDocument();
  });

  it('shows "Got it" button on wrong answer', async () => {
    const user = userEvent.setup();
    render(<TrueFalse exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('False'));
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
  });

  it('calls onAnswer(false) when "Got it" is clicked', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<TrueFalse exercise={exercise} onAnswer={onAnswer} />);
    await user.click(screen.getByText('False'));
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onAnswer).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('disables True/False buttons after selection', async () => {
    const user = userEvent.setup();
    render(<TrueFalse exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('False'));
    // After selection, buttons are disabled (labels change to ✓/✗ prefix)
    const buttons = screen.getAllByRole('button').filter(b => b.className.includes('tf-btn'));
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });
});

describe('TrueFalse collab', () => {
  it('broadcasts selected value', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = { type: 'true-false', statement: 'X', answer: true };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <TrueFalse exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    fireEvent.click(screen.getByText(/true/i));
    await new Promise(r => setTimeout(r, 10));
    expect(received.some(p => p.field === 'selected' && p.value === true)).toBe(true);
  });
});
