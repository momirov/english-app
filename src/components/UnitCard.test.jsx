import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UnitCard from './UnitCard';

beforeEach(() => {
  localStorage.clear();
});

const makeUnit = (overrides = {}) => ({
  id: 'test',
  number: 1,
  title: 'Test unit',
  color: '#000000',
  lessons: [{ id: 'test-l1', type: 'vocabulary', title: 'L1', canDo: '', exercises: [] }],
  ...overrides,
});

describe('UnitCard', () => {
  it('renders "Starter" for number === 0', () => {
    render(<UnitCard unit={makeUnit({ number: 0, title: 'Starter Unit' })} onClick={vi.fn()} />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
  });

  it('renders "Unit N" for a numbered unit', () => {
    render(<UnitCard unit={makeUnit({ number: 5 })} onClick={vi.fn()} />);
    expect(screen.getByText('Unit 5')).toBeInTheDocument();
  });

  it('renders no "Unit null" label when number is null', () => {
    render(<UnitCard unit={makeUnit({ number: null, title: 'Irregular verbs' })} onClick={vi.fn()} />);
    expect(screen.queryByText(/Unit null/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Unit 0/)).not.toBeInTheDocument();
    // The title still renders in the card body
    expect(screen.getByText('Irregular verbs')).toBeInTheDocument();
  });
});
