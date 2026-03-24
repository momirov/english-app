import { useState } from 'react';
import './Exercise.css';
import useFeedback from '../../hooks/useFeedback';

export default function MultipleChoice({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const { revealed, waitingForAck, handleReveal, handleAck } = useFeedback({
    onAnswer: () => onAnswer(selected === exercise.answer, {
      question: exercise.question,
      studentAnswer: selected,
      correctAnswer: exercise.answer,
    }),
  });

  function handleSelect(opt) {
    if (revealed) return;
    setSelected(opt);
    handleReveal(opt === exercise.answer);
  }

  return (
    <div className="exercise">
      <p className="exercise-question">{exercise.question}</p>
      <div className="mc-options">
        {exercise.options.map((opt) => {
          let cls = 'mc-option';
          if (revealed) {
            if (opt === exercise.answer) cls += ' correct';
            else if (opt === selected) cls += ' wrong';
          }
          return (
            <button key={opt} className={cls} onClick={() => handleSelect(opt)} disabled={revealed}>
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <p className="feedback">
          {selected === exercise.answer ? '✓ Correct!' : `✗ The answer is: ${exercise.answer}`}
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
