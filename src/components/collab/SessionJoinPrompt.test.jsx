import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionJoinPrompt from './SessionJoinPrompt.jsx';

describe('SessionJoinPrompt', () => {
  it('renders the room code', () => {
    render(<SessionJoinPrompt roomCode="RED-FOX-12" onAccept={() => {}} onDecline={() => {}} />);
    expect(screen.getByText(/RED-FOX-12/)).toBeInTheDocument();
  });

  it('calls onAccept when Join clicked', () => {
    const onAccept = vi.fn();
    render(<SessionJoinPrompt roomCode="R" onAccept={onAccept} onDecline={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /join/i }));
    expect(onAccept).toHaveBeenCalled();
  });

  it('calls onDecline when Cancel clicked', () => {
    const onDecline = vi.fn();
    render(<SessionJoinPrompt roomCode="R" onAccept={() => {}} onDecline={onDecline} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onDecline).toHaveBeenCalled();
  });
});
