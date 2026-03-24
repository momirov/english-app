import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TrueFalse from './TrueFalse';

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
});
