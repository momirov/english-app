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
  // Each right is {id, value} so duplicate values are still uniquely identifiable
  const [rights, setRights] = useState(() =>
    shuffle(exercise.pairs.map((p, i) => ({ id: i, value: p.right })))
  );
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState({}); // left -> right value
  const [wrongId, setWrongId] = useState(null); // id of wrong right item
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
    setWrongId(null);
  }

  function handleRight(rightItem) {
    if (done || !selectedLeft) return;
    const isCorrect = correctMap[selectedLeft] === rightItem.value;
    if (isCorrect) {
      setMatched((m) => ({ ...m, [selectedLeft]: rightItem.value }));
      setRights((r) => r.filter((x) => x.id !== rightItem.id));
      setSelectedLeft(null);
    } else {
      setWrongId(rightItem.id);
      setTimeout(() => {
        setWrongId(null);
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
            const isWrong = wrongId !== null && selectedLeft === l;
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
        </div>
        <div className="matching-col">
          {rights.map((r) => {
            const isWrong = r.id === wrongId;
            return (
              <button
                key={r.id}
                className={`match-item ${isWrong ? 'wrong' : ''} ${selectedLeft ? 'clickable' : ''}`}
                onClick={() => handleRight(r)}
              >
                {r.value}
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
