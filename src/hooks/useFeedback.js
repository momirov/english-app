import { useState, useRef, useCallback, useEffect } from 'react';

export default function useFeedback({ onAnswer }) {
  const [revealed, setRevealed] = useState(false);
  const [waitingForAck, setWaitingForAck] = useState(false);

  // Use refs so callbacks are always stable (no stale closure issues)
  const revealedRef = useRef(false);
  const timerRef = useRef(null);
  const onAnswerRef = useRef(onAnswer);

  // Keep onAnswerRef current on every render
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  // Clear timer on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleReveal = useCallback((isCorrect) => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    if (isCorrect) {
      timerRef.current = setTimeout(() => onAnswerRef.current(), 500);
    } else {
      setWaitingForAck(true);
    }
  }, []);

  const handleAck = useCallback(() => {
    clearTimeout(timerRef.current);
    onAnswerRef.current();
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    revealedRef.current = false;
    setRevealed(false);
    setWaitingForAck(false);
  }, []);

  return { revealed, waitingForAck, handleReveal, handleAck, reset };
}
