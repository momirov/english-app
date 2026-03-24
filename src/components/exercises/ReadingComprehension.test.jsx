import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ReadingComprehension from './ReadingComprehension.jsx';

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
