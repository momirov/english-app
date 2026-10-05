import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookCard from './BookCard';
import { markLesson } from '../hooks/useProgress.js';

beforeEach(() => {
  localStorage.clear();
});

const book = {
  id: 'b',
  title: 'English Plus 9',
  level: 'B2',
  color: '#123456',
  units: [
    { id: 'u1', number: 1, lessons: [{ id: 'b-1' }, { id: 'b-2' }] },
    { id: 'u2', number: 2, lessons: [{ id: 'b-3' }, { id: 'b-4' }] },
    { id: 'extra', number: null, lessons: [] },
  ],
};

describe('BookCard', () => {
  it('shows title, level and numbered-unit count', () => {
    render(<BookCard book={book} onClick={vi.fn()} />);
    expect(screen.getByText('English Plus 9')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    expect(screen.getByText('2 units')).toBeInTheDocument();
  });

  it('shows percent of lessons completed across all units', () => {
    markLesson('b-1', 1, 1);
    render(<BookCard book={book} onClick={vi.fn()} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});
