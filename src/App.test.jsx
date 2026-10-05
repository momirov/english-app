import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import App from './App.jsx';

beforeEach(() => {
  localStorage.clear();
});

function renderAt(path) {
  const loc = memoryLocation({ path, record: true });
  render(
    <Router hook={loc.hook}>
      <App />
    </Router>
  );
  return loc;
}

const current = (loc) => loc.history[loc.history.length - 1];

describe('App routing', () => {
  it('home shows both books', () => {
    renderAt('/');
    expect(screen.getByText('English Plus 1')).toBeInTheDocument();
    expect(screen.getByText('English Plus 2')).toBeInTheDocument();
  });

  it('clicking a book opens its unit grid', async () => {
    const loc = renderAt('/');
    await userEvent.click(screen.getByText('English Plus 1'));
    expect(current(loc)).toBe('/ep1');
    expect(screen.getByText('Food and health')).toBeInTheDocument();
  });

  it('/ep2 shows Book 2 grid with Irregular verbs', () => {
    renderAt('/ep2');
    expect(screen.getByText('English Plus 2')).toBeInTheDocument();
    expect(screen.getByText('Irregular verbs')).toBeInTheDocument();
  });

  it('back from a unit grid goes to the book picker', async () => {
    const loc = renderAt('/ep1');
    await userEvent.click(screen.getByLabelText('Go back'));
    expect(current(loc)).toBe('/');
  });

  it('/ep1/unit5 shows the unit page; back goes to /ep1', async () => {
    const loc = renderAt('/ep1/unit5');
    expect(screen.getByRole('heading', { name: 'Food and health' })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Go back'));
    expect(current(loc)).toBe('/ep1');
  });

  it('redirects legacy /unit5 to /ep1/unit5', () => {
    const loc = renderAt('/unit5');
    expect(current(loc)).toBe('/ep1/unit5');
    expect(screen.getByRole('heading', { name: 'Food and health' })).toBeInTheDocument();
  });

  it('redirects legacy lesson URLs', () => {
    const loc = renderAt('/unit5/unit5-vocab1/2');
    expect(current(loc)).toBe('/ep1/unit5/unit5-vocab1/2');
  });

  it('unknown book sends you home', () => {
    const loc = renderAt('/nope');
    expect(current(loc)).toBe('/');
  });

  it('unknown unit inside a book goes to that book', () => {
    const loc = renderAt('/ep2/unit99');
    expect(current(loc)).toBe('/ep2');
  });
});
