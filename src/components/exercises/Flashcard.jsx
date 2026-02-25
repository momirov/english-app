import { useState } from 'react';
import './Exercise.css';

export default function Flashcard({ exercise, onAnswer }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const card = exercise.cards[index];
  const total = exercise.cards.length;

  function handleFlip() {
    setFlipped(!flipped);
  }

  function handleNext() {
    if (index < total - 1) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      setDone(true);
      setTimeout(() => onAnswer(true, { cards: exercise.cards }), 400);
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
      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={handleFlip}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <span>{card.front}</span>
          </div>
          <div className="flashcard-back">
            <span>{card.back}</span>
          </div>
        </div>
      </div>
      <div className="flashcard-controls">
        {flipped && (
          <button className="btn-primary" onClick={handleNext}>
            {index < total - 1 ? 'Next card →' : 'Finish'}
          </button>
        )}
        {!flipped && (
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
