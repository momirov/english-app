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

  it('advances to the next question after answering', async () => {
    const user = userEvent.setup();
    render(<ReadingComprehension exercise={exercise} onAnswer={vi.fn()} />);
    await user.click(screen.getByText('Athens'));
    // wait for auto-advance (900ms timeout mocked by not being there yet — check next question appeared)
    await screen.findByText('When did they take place?');
  });

  it('calls onAnswer with correct=true when all questions answered correctly', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<ReadingComprehension exercise={exercise} onAnswer={onAnswer} />);
    await user.click(screen.getByText('Athens'));
    await screen.findByText('When did they take place?');
    await user.click(screen.getByText('1896'));
    await vi.waitFor(() => expect(onAnswer).toHaveBeenCalledWith(true, expect.any(Object)));
  });

  it('calls onAnswer with correct=false when any question answered wrong', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<ReadingComprehension exercise={exercise} onAnswer={onAnswer} />);
    await user.click(screen.getByText('Paris')); // wrong
    await screen.findByText('When did they take place?');
    await user.click(screen.getByText('1896')); // correct
    await vi.waitFor(() => expect(onAnswer).toHaveBeenCalledWith(false, expect.any(Object)));
  });
});
