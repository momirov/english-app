import { useState, useRef } from 'react';
import './Exercise.css';

export default function Flashcard({ exercise, onAnswer }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'out' | 'in'
  const [done, setDone] = useState(false);
  const nextIndexRef = useRef(null);

  const card = exercise.cards[index];
  const total = exercise.cards.length;
  const isTransitioning = phase !== 'idle';

  // Drive all transform/transition via inline style so CSS classes don't conflict
  const innerStyle = {
    transform:
      phase === 'out' ? 'rotateY(90deg)' :
      phase === 'in'  ? 'rotateY(-90deg)' :
      flipped         ? 'rotateY(180deg)' :
                        'rotateY(0deg)',
    transition: phase === 'in' ? 'none' : 'transform .25s',
  };

  function handleFlip() {
    if (!isTransitioning) setFlipped(f => !f);
  }

  function handleNext() {
    if (index < total - 1) {
      nextIndexRef.current = index + 1;
      setFlipped(false);
      setPhase('out');
    } else {
      setDone(true);
      setTimeout(() => onAnswer(true, { cards: exercise.cards }), 400);
    }
  }

  function handleTransitionEnd() {
    if (phase === 'out') {
      // Card is edge-on: swap content and jump to -90deg (no transition)
      setIndex(nextIndexRef.current);
      setPhase('in');
      // Double RAF ensures browser registers -90deg before animating to 0deg
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('idle')));
    }
  }

  if (done) {
    return (
      <div className="exercise">
        <p className="feedback">✓ All cards reviewed!</p>
      </div>
    );
  }

  return (
    <div className="exercise">
      <p className="exercise-label">
        Flashcards — card {index + 1} of {total}. Tap to flip!
      </p>
      <div className="flashcard" onClick={handleFlip}>
        <div className="flashcard-inner" style={innerStyle} onTransitionEnd={handleTransitionEnd}>
          <div className="flashcard-front">
            <span>{card.front}</span>
          </div>
          <div className="flashcard-back">
            <span>{card.back}</span>
          </div>
        </div>
      </div>
      <div className="flashcard-controls">
        {flipped && !isTransitioning && (
          <button className="btn-primary" onClick={handleNext}>
            {index < total - 1 ? 'Next card →' : 'Finish'}
          </button>
        )}
        {!flipped && !isTransitioning && (
          <button className="btn-secondary" onClick={handleFlip}>
            Flip
          </button>
        )}
      </div>
      <div className="fc-progress">
        {exercise.cards.map((_, i) => (
          <span key={i} className={`fc-dot ${i < index ? 'done' : i === index ? 'current' : ''}`} />
        ))}
      </div>
    </div>
  );
}
