import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import WordOrder from './WordOrder';
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

const exercise = {
  type: 'word-order',
  words: ['is', 'she', 'reading', '.'],
  answer: ['She', 'is', 'reading', '.'],
};

describe('WordOrder', () => {
  it('renders available words and the Check button', () => {
    render(<WordOrder exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByText('Check')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
  });

  it('shows no "Got it" button on correct answer', async () => {
    const user = userEvent.setup();
    render(<WordOrder exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('she'));
    await user.click(screen.getByText('is'));
    await user.click(screen.getByText('reading'));
    await user.click(screen.getByText('.'));
    await user.click(screen.getByText('Check'));
    expect(screen.queryByRole('button', { name: 'Got it' })).not.toBeInTheDocument();
  });

  it('shows "Got it" button on wrong answer', async () => {
    const user = userEvent.setup();
    render(<WordOrder exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('is'));
    await user.click(screen.getByText('she'));
    await user.click(screen.getByText('Check'));
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
  });

  it('calls onAnswer(false) when "Got it" is clicked', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<WordOrder exercise={exercise} onAnswer={onAnswer} />);
    await user.click(screen.getByText('is'));
    await user.click(screen.getByText('she'));
    await user.click(screen.getByText('Check'));
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onAnswer).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('disables word buttons after Check is clicked', async () => {
    const user = userEvent.setup();
    render(<WordOrder exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('is'));
    await user.click(screen.getByText('she'));
    await user.click(screen.getByText('Check'));
    // After reveal, all word buttons in sentence are disabled
    const chosenButtons = screen.getAllByRole('button').filter(b => b.className.includes('wo-word'));
    chosenButtons.forEach(btn => expect(btn).toBeDisabled());
  });
});

describe('WordOrder collab', () => {
  it('broadcasts chosen array when a word is picked', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = { type: 'word-order', words: ['is','cat','the','Oxford'], answer: ['Oxford','is','the','cat'] };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <WordOrder exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    fireEvent.click(screen.getByText('Oxford'));
    await new Promise(r => setTimeout(r, 10));
    expect(received.some(p => p.field === 'chosen' && Array.isArray(p.value) && p.value.includes('Oxford'))).toBe(true);
  });
});
