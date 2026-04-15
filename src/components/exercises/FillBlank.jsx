import { useState } from 'react';
import './Exercise.css';
import useFeedback from '../../hooks/useFeedback';
import { useCollabField } from '../../collab/useCollabField.jsx';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FillBlank({ exercise, onAnswer }) {
  const [chosen, setChosen] = useCollabField('chosen', null);
  const [shuffledWords] = useState(() => shuffle(exercise.wordBank));

  const parts = exercise.template.split('___');

  const { revealed, waitingForAck, handleReveal, handleAck } = useFeedback({
    onAnswer: () => onAnswer(chosen === exercise.answer, {
      template: exercise.template,
      studentAnswer: chosen,
      correctAnswer: exercise.answer,
    }),
  });

  function handlePick(word) {
    if (revealed) return;
    setChosen(word);
    handleReveal(word === exercise.answer);
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
      {waitingForAck && (
        <div className="got-it-bar">
          <button className="btn-primary" onClick={handleAck}>Got it</button>
        </div>
      )}
    </div>
  );
}
