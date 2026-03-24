import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import GrammarTable from './GrammarTable';

const exercise = {
  type: 'grammar-table',
  title: 'Present simple: to be',
  rows: [
    { prompt: 'I', answer: 'am' },
    { prompt: 'He / She', answer: 'is' },
    { prompt: 'They', answer: 'are' },
  ],
};

describe('GrammarTable', () => {
  it('renders the title and input fields', () => {
    render(<GrammarTable exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByText('Present simple: to be')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('type here...')).toHaveLength(3);
  });

  it('shows Check answers button before checking', () => {
    render(<GrammarTable exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Check answers' })).toBeInTheDocument();
  });

  it('calls onAnswer with proportional scoring for all correct', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<GrammarTable exercise={exercise} onAnswer={onAnswer} />);
    const inputs = screen.getAllByPlaceholderText('type here...');
    await user.type(inputs[0], 'am');
    await user.type(inputs[1], 'is');
    await user.type(inputs[2], 'are');
    await user.click(screen.getByRole('button', { name: 'Check answers' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onAnswer).toHaveBeenCalledWith(true, expect.objectContaining({
      proportional: { correct: 3, total: 3 },
    }));
  });

  it('calls onAnswer with proportional scoring for partial correct', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<GrammarTable exercise={exercise} onAnswer={onAnswer} />);
    const inputs = screen.getAllByPlaceholderText('type here...');
    await user.type(inputs[0], 'am');
    await user.type(inputs[1], 'wrong');
    await user.type(inputs[2], 'are');
    await user.click(screen.getByRole('button', { name: 'Check answers' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onAnswer).toHaveBeenCalledWith(true, expect.objectContaining({
      proportional: { correct: 2, total: 3 },
    }));
  });
});
