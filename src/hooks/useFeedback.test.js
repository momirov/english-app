import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useFeedback from './useFeedback';

describe('useFeedback', () => {
  it('starts with revealed=false and waitingForAck=false', () => {
    const { result } = renderHook(() => useFeedback({ onAnswer: vi.fn() }));
    expect(result.current.revealed).toBe(false);
    expect(result.current.waitingForAck).toBe(false);
  });

  it('sets revealed=true on handleReveal', () => {
    const { result } = renderHook(() => useFeedback({ onAnswer: vi.fn() }));
    act(() => result.current.handleReveal(true));
    expect(result.current.revealed).toBe(true);
  });

  it('calls onAnswer after 500ms when correct', () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();
    const { result } = renderHook(() => useFeedback({ onAnswer }));
    act(() => result.current.handleReveal(true));
    expect(onAnswer).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(500));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('sets waitingForAck=true on wrong and does NOT call onAnswer', () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();
    const { result } = renderHook(() => useFeedback({ onAnswer }));
    act(() => result.current.handleReveal(false));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.waitingForAck).toBe(true);
    expect(onAnswer).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('handleAck calls onAnswer immediately', () => {
    const onAnswer = vi.fn();
    const { result } = renderHook(() => useFeedback({ onAnswer }));
    act(() => result.current.handleReveal(false));
    act(() => result.current.handleAck());
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  it('handleReveal is a no-op if already revealed (guards double-call)', () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();
    const { result } = renderHook(() => useFeedback({ onAnswer }));
    act(() => result.current.handleReveal(true));
    act(() => result.current.handleReveal(false)); // second call — ignored
    act(() => vi.advanceTimersByTime(500));
    expect(onAnswer).toHaveBeenCalledTimes(1); // called once only
    vi.useRealTimers();
  });

  it('reset() clears revealed, waitingForAck, and allows handleReveal again', () => {
    const onAnswer = vi.fn();
    const { result } = renderHook(() => useFeedback({ onAnswer }));
    act(() => result.current.handleReveal(false));
    expect(result.current.revealed).toBe(true);
    act(() => result.current.reset());
    expect(result.current.revealed).toBe(false);
    expect(result.current.waitingForAck).toBe(false);
    // handleReveal works again after reset
    act(() => result.current.handleReveal(false));
    expect(result.current.revealed).toBe(true);
  });

  it('clears the timer on unmount to prevent calling onAnswer on unmounted component', () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();
    const { result, unmount } = renderHook(() => useFeedback({ onAnswer }));
    act(() => result.current.handleReveal(true));
    unmount();
    act(() => vi.advanceTimersByTime(500));
    expect(onAnswer).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('always calls the latest onAnswer (stale closure guard)', () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const second = vi.fn();
    let currentOnAnswer = first;
    const { result, rerender } = renderHook(() => useFeedback({ onAnswer: currentOnAnswer }));
    act(() => result.current.handleReveal(true));
    // Update onAnswer before timer fires
    currentOnAnswer = second;
    rerender();
    act(() => vi.advanceTimersByTime(500));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
