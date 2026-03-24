import { useState } from 'react';
import './Exercise.css';
import useFeedback from '../../hooks/useFeedback';

export default function WordOrder({ exercise, onAnswer }) {
  const [available, setAvailable] = useState([...exercise.words]);
  const [chosen, setChosen] = useState([]);
  const [lastCorrect, setLastCorrect] = useState(false);

  const { revealed, waitingForAck, handleReveal, handleAck } = useFeedback({
    onAnswer: () => onAnswer(lastCorrect, {
      studentAnswer: chosen.join(' '),
      correctAnswer: exercise.answer.join(' '),
    }),
  });

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
    const isCorrect =
      exercise.answer.map((w) => w.toLowerCase()).join(' ') ===
      chosen.map((w) => w.toLowerCase()).join(' ');
    setLastCorrect(isCorrect);
    handleReveal(isCorrect);
  }

  function handleReset() {
    if (revealed) return;
    setAvailable([...exercise.words]);
    setChosen([]);
  }

  return (
    <div className="exercise">
      <p className="exercise-label">Put the words in the correct order:</p>

      <div className={`word-order-sentence ${revealed ? (lastCorrect ? 'correct-bg' : 'wrong-bg') : ''}`}>
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
          {lastCorrect ? '✓ Correct!' : `✗ Correct order: ${exercise.answer.join(' ')}`}
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
