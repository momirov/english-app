import { useState } from 'react';
import './Exercise.css';

export default function ReadingComprehension({ exercise, onAnswer }) {
  const { passage, questions } = exercise;
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const current = questions[qIdx];

  function handleSelect(opt) {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const correct = opt === current.answer;
    const newWrongCount = correct ? wrongCount : wrongCount + 1;
    setWrongCount(newWrongCount);

    setTimeout(() => {
      const isLast = qIdx + 1 >= questions.length;
      if (isLast) {
        onAnswer(newWrongCount === 0, { wrongCount: newWrongCount, total: questions.length });
      } else {
        setQIdx(qIdx + 1);
        setSelected(null);
        setRevealed(false);
      }
    }, 900);
  }

  return (
    <div className="exercise">
      <div className="rc-passage">
        <p className="exercise-label">Read the text</p>
        <p className="rc-passage-text">{passage}</p>
      </div>
      <div className="rc-question">
        <p className="exercise-question">{current.question}</p>
        <p className="rc-progress">{qIdx + 1} / {questions.length}</p>
        <div className="mc-options">
          {current.options.map((opt) => {
            let cls = 'mc-option';
            if (revealed) {
              if (opt === current.answer) cls += ' correct';
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
            {selected === current.answer ? '✓ Correct!' : `✗ The answer is: ${current.answer}`}
          </p>
        )}
      </div>
    </div>
  );
}
