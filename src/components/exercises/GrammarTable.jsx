import { useState } from 'react';
import './Exercise.css';

export default function GrammarTable({ exercise, onAnswer }) {
  const [answers, setAnswers] = useState(exercise.rows.map(() => ''));
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  function handleChange(idx, val) {
    const updated = [...answers];
    updated[idx] = val;
    setAnswers(updated);
  }

  function handleCheck() {
    let correct = 0;
    exercise.rows.forEach((row, i) => {
      if (answers[i].trim().toLowerCase() === row.answer.toLowerCase()) correct++;
    });
    setScore(correct);
    setRevealed(true);
  }

  return (
    <div className="exercise">
      <p className="exercise-label">{exercise.title}</p>
      <table className="grammar-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Answer</th>
            {revealed && <th>Correct</th>}
          </tr>
        </thead>
        <tbody>
          {exercise.rows.map((row, i) => {
            const isCorrect = answers[i].trim().toLowerCase() === row.answer.toLowerCase();
            return (
              <tr key={i}>
                <td className="gt-prompt">
                  {row.prompt}
                  {row.verb && <span className="gt-verb-hint"> ({row.verb})</span>}
                </td>
                <td>
                  <input
                    type="text"
                    className={`gt-input ${revealed ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                    value={answers[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    disabled={revealed}
                    placeholder="type here..."
                    autoComplete="off"
                  />
                </td>
                {revealed && (
                  <td className={isCorrect ? 'cell-correct' : 'cell-wrong'}>
                    {isCorrect ? '✓' : row.answer}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!revealed && (
        <button className="btn-primary" onClick={handleCheck} style={{ marginTop: '1rem' }}>
          Check answers
        </button>
      )}
      {revealed && (
        <>
          <p className="feedback">
            {score === exercise.rows.length
              ? '✓ Perfect!'
              : `${score} / ${exercise.rows.length} correct`}
          </p>
          <button className="btn-primary" onClick={() => onAnswer(score === exercise.rows.length, { title: exercise.title, rows: exercise.rows, studentAnswers: answers })} style={{ marginTop: '0.5rem' }}>
            Next
          </button>
        </>
      )}
    </div>
  );
}
