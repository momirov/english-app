import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import WordOrder from './WordOrder';

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
