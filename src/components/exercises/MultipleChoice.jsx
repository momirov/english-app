import { useState } from 'react';
import './Exercise.css';

export default function MultipleChoice({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(opt) {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const correct = opt === exercise.answer;
    setTimeout(() => onAnswer(correct), 900);
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
    </div>
  );
}
