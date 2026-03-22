import { useState } from 'react';
import './Exercise.css';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FillBlank({ exercise, onAnswer }) {
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [shuffledWords] = useState(() => shuffle(exercise.wordBank));

  // Build display parts: split on ___
  const parts = exercise.template.split('___');

  function handlePick(word) {
    if (revealed) return;
    setChosen(word);
    setRevealed(true);
    const correct = word === exercise.answer;
    setTimeout(() => onAnswer(correct, { template: exercise.template, studentAnswer: word, correctAnswer: exercise.answer }), 900);
  }

  return (
    <div className="exercise">
      <p className="exercise-label">Fill in the blank:</p>
      <p className="fill-sentence">
        {parts[0]}
        <span className={`blank-slot ${revealed ? (chosen === exercise.answer ? 'correct' : 'wrong') : chosen ? 'filled' : ''}`}>
          {chosen || '___'}
        </span>
        {parts[1]}
      </p>
      <div className="word-bank">
        {shuffledWords.map((word) => (
          <button
            key={word}
            className={`word-chip ${chosen === word ? 'used' : ''}`}
            onClick={() => handlePick(word)}
            disabled={revealed}
          >
            {word}
          </button>
        ))}
      </div>
      {revealed && (
        <p className="feedback">
          {chosen === exercise.answer ? '✓ Correct!' : `✗ The answer is: ${exercise.answer}`}
        </p>
      )}
    </div>
  );
}
