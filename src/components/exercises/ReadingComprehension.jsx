import { useState, useRef } from 'react';
import './Exercise.css';
import useFeedback from '../../hooks/useFeedback';
import { useCollabField } from '../../collab/useCollabField.jsx';

export default function ReadingComprehension({ exercise, onAnswer }) {
  const { passage, questions } = exercise;
  const [qIdx, setQIdx] = useCollabField('qIdx', 0);
  const [selected, setSelected] = useCollabField('selected', null);
  const wrongCountRef = useRef(0);
  // resetRef breaks the circular dependency: handleAdvance needs reset,
  // but reset comes from useFeedback which needs handleAdvance
  const resetRef = useRef(null);

  const current = questions[qIdx];

  function handleAdvance() {
    const isLast = qIdx + 1 >= questions.length;
    if (isLast) {
      const wc = wrongCountRef.current;
      onAnswer(true, {
        wrongCount: wc,
        total: questions.length,
        proportional: { correct: questions.length - wc, total: questions.length },
      });
    } else {
      setQIdx((q) => q + 1);
      setSelected(null);
      resetRef.current?.();
    }
  }

  const { revealed, waitingForAck, handleReveal, handleAck, reset } = useFeedback({
    onAnswer: handleAdvance,
  });
  // Keep resetRef current so handleAdvance can call reset()
  resetRef.current = reset;

  function handleSelect(opt) {
    if (revealed) return;
    setSelected(opt);
    const isCorrect = opt === current.answer;
    if (!isCorrect) wrongCountRef.current += 1;
    handleReveal(isCorrect);
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
        {waitingForAck && (
          <div className="got-it-bar">
            <button className="btn-primary" onClick={handleAck}>Got it</button>
          </div>
        )}
      </div>
    </div>
  );
}
