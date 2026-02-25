import { useState, useEffect } from 'react';
import './Exercise.css';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Matching({ exercise, onAnswer }) {
  const [lefts] = useState(() => exercise.pairs.map((p) => p.left));
  const [rights, setRights] = useState(() => shuffle(exercise.pairs.map((p) => p.right)));
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState({}); // left -> right
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(false);

  const correctMap = Object.fromEntries(exercise.pairs.map((p) => [p.left, p.right]));

  useEffect(() => {
    if (Object.keys(matched).length === exercise.pairs.length && !done) {
      setDone(true);
      const allCorrect = Object.entries(matched).every(([l, r]) => correctMap[l] === r);
      setTimeout(() => onAnswer(allCorrect, { pairs: exercise.pairs, studentMatches: matched }), 600);
    }
  }, [matched]);

  function handleLeft(item) {
    if (done) return;
    setSelectedLeft(item === selectedLeft ? null : item);
    setWrong(null);
  }

  function handleRight(item) {
    if (done || !selectedLeft) return;
    const isCorrect = correctMap[selectedLeft] === item;
    if (isCorrect) {
      setMatched((m) => ({ ...m, [selectedLeft]: item }));
      setRights((r) => r.filter((x) => x !== item));
      setSelectedLeft(null);
    } else {
      setWrong({ left: selectedLeft, right: item });
      setTimeout(() => {
        setWrong(null);
        setSelectedLeft(null);
      }, 700);
    }
  }

  return (
    <div className="exercise">
      <p className="exercise-label">Match the items:</p>
      <div className="matching-grid">
        <div className="matching-col">
          {lefts.map((l) => {
            const isMatched = matched[l] !== undefined;
            const isSelected = selectedLeft === l;
            const isWrong = wrong?.left === l;
            return (
              <button
                key={l}
                className={`match-item ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => !isMatched && handleLeft(l)}
                disabled={isMatched}
              >
                {l}
              </button>
            );
          })}
          {/* Show matched pairs on left side */}
        </div>
        <div className="matching-col">
          {/* Unmatched rights */}
          {rights.map((r) => {
            const isWrong = wrong?.right === r;
            return (
              <button
                key={r}
                className={`match-item ${isWrong ? 'wrong' : ''} ${selectedLeft ? 'clickable' : ''}`}
                onClick={() => handleRight(r)}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
      {/* Show matched pairs */}
      {Object.entries(matched).length > 0 && (
        <div className="matched-pairs">
          {Object.entries(matched).map(([l, r]) => (
            <div key={l} className="matched-row">
              <span className="match-item matched small">{l}</span>
              <span className="match-arrow">→</span>
              <span className="match-item matched small">{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
