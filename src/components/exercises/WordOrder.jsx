import { useState } from 'react';
import './Exercise.css';

export default function WordOrder({ exercise, onAnswer }) {
  const [available, setAvailable] = useState([...exercise.words]);
  const [chosen, setChosen] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);

  function addWord(word, idx) {
    if (revealed) return;
    const newAvail = [...available];
    newAvail.splice(idx, 1);
    setAvailable(newAvail);
    setChosen([...chosen, word]);
  }

  function removeWord(word, idx) {
    if (revealed) return;
    const newChosen = [...chosen];
    newChosen.splice(idx, 1);
    setChosen(newChosen);
    setAvailable([...available, word]);
  }

  function handleCheck() {
    if (chosen.length === 0) return;
    const answerLower = exercise.answer.map((w) => w.toLowerCase()).join(' ');
    const chosenLower = chosen.map((w) => w.toLowerCase()).join(' ');
    const isCorrect = answerLower === chosenLower;
    setCorrect(isCorrect);
    setRevealed(true);
    setTimeout(() => onAnswer(isCorrect), 900);
  }

  function handleReset() {
    if (revealed) return;
    setAvailable([...exercise.words]);
    setChosen([]);
  }

  return (
    <div className="exercise">
      <p className="exercise-label">Put the words in the correct order:</p>

      <div className={`word-order-sentence ${revealed ? (correct ? 'correct-bg' : 'wrong-bg') : ''}`}>
        {chosen.length === 0 ? (
          <span className="placeholder">Click words below to build the sentence</span>
        ) : (
          chosen.map((w, i) => (
            <button key={i} className="wo-word chosen" onClick={() => removeWord(w, i)} disabled={revealed}>
              {w}
            </button>
          ))
        )}
      </div>

      <div className="word-order-bank">
        {available.map((w, i) => (
          <button key={i} className="wo-word" onClick={() => addWord(w, i)} disabled={revealed}>
            {w}
          </button>
        ))}
      </div>

      {!revealed && (
        <div className="wo-actions">
          <button className="btn-primary" onClick={handleCheck} disabled={chosen.length === 0}>
            Check
          </button>
          <button className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}

      {revealed && (
        <p className="feedback">
          {correct ? '✓ Correct!' : `✗ Correct order: ${exercise.answer.join(' ')}`}
        </p>
      )}
    </div>
  );
}
