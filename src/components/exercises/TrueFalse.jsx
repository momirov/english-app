import { useState } from 'react';
import './Exercise.css';

export default function TrueFalse({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(value) {
    if (revealed) return;
    setSelected(value);
    setRevealed(true);
    const correct = value === exercise.answer;
    setTimeout(() => onAnswer(correct, { statement: exercise.statement, studentAnswer: value, correctAnswer: exercise.answer }), 900);
  }

  function label(val) {
    if (!revealed) return val ? 'True' : 'False';
    if (val === exercise.answer) return val ? '✓ True' : '✓ False';
    return val ? '✗ True' : '✗ False';
  }

  return (
    <div className="exercise">
      <p className="exercise-question">{exercise.statement}</p>
      <div className="tf-buttons">
        {[true, false].map((val) => {
          let cls = 'tf-btn';
          if (revealed) {
            if (val === exercise.answer) cls += ' correct';
            else if (val === selected) cls += ' wrong';
          }
          return (
            <button key={String(val)} className={cls} onClick={() => handleSelect(val)} disabled={revealed}>
              {val ? 'True' : 'False'}
            </button>
          );
        })}
      </div>
      {revealed && (
        <p className="feedback">
          {selected === exercise.answer
            ? '✓ Correct!'
            : `✗ The answer is: ${exercise.answer ? 'True' : 'False'}`}
        </p>
      )}
    </div>
  );
}
