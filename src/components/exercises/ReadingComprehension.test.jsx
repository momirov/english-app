import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ReadingComprehension from './ReadingComprehension.jsx';
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

const exercise = {
  type: 'reading-comprehension',
  passage: 'The first modern Olympic Games took place in Athens in 1896.',
  questions: [
    {
      question: 'Where did the first modern Olympics take place?',
      options: ['Paris', 'Athens', 'London'],
      answer: 'Athens',
    },
    {
      question: 'When did they take place?',
      options: ['1886', '1896', '1906'],
      answer: '1896',
    },
  ],
};

describe('ReadingComprehension', () => {
  it('shows the passage text', () => {
    render(<ReadingComprehension exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByText(/Athens in 1896/)).toBeInTheDocument();
  });

  it('shows the first question and its options', () => {
    render(<ReadingComprehension exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByText('Where did the first modern Olympics take place?')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Athens')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('marks correct answer green and wrong answer red after selection', async () => {
    const user = userEvent.setup();
    render(<ReadingComprehension exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('Paris'));
    expect(screen.getByText('Athens')).toHaveClass('correct');
    expect(screen.getByText('Paris')).toHaveClass('wrong');
  });

  it('shows "Got it" button on wrong answer and advances after clicking it', async () => {
    const user = userEvent.setup();
    render(<ReadingComprehension exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('Paris')); // wrong
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(await screen.findByText('When did they take place?')).toBeInTheDocument();
  });

  it('advances to the next question automatically on correct answer', async () => {
    const user = userEvent.setup();
    render(<ReadingComprehension exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('Athens')); // correct — auto-advances
    expect(await screen.findByText('When did they take place?')).toBeInTheDocument();
  });

  it('calls onAnswer with proportional scoring when all questions answered correctly', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<ReadingComprehension exercise={exercise} onAnswer={onAnswer} />);
    await user.click(screen.getByText('Athens')); // correct
    await screen.findByText('When did they take place?');
    await user.click(screen.getByText('1896')); // correct
    await vi.waitFor(() =>
      expect(onAnswer).toHaveBeenCalledWith(true, expect.objectContaining({
        proportional: { correct: 2, total: 2 },
      }))
    );
  });

  it('calls onAnswer with proportional scoring when some questions are wrong', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<ReadingComprehension exercise={exercise} onAnswer={onAnswer} />);
    await user.click(screen.getByText('Paris')); // wrong
    await user.click(await screen.findByRole('button', { name: 'Got it' }));
    await screen.findByText('When did they take place?');
    await user.click(screen.getByText('1896')); // correct — last question auto-advances
    await vi.waitFor(() =>
      expect(onAnswer).toHaveBeenCalledWith(true, expect.objectContaining({
        proportional: { correct: 1, total: 2 },
      }))
    );
  });
});

describe('ReadingComprehension collab', () => {
  it('broadcasts selected when an option is clicked', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = {
      type: 'reading-comprehension',
      passage: 'A cat sat on a mat.',
      questions: [
        { question: 'What sat?', options: ['cat','dog','bird','fish'], answer: 'cat' },
      ],
    };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <ReadingComprehension exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    fireEvent.click(screen.getByText('cat'));
    await new Promise(r => setTimeout(r, 10));
    expect(received.some(p => p.field === 'selected' && p.value === 'cat')).toBe(true);
  });
});
