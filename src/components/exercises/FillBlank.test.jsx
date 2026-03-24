import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FillBlank from './FillBlank';

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
