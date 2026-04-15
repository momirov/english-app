import './Exercise.css';
import useFeedback from '../../hooks/useFeedback';
import { useCollabField } from '../../collab/useCollabField.jsx';

export default function TrueFalse({ exercise, onAnswer }) {
  const [selected, setSelected] = useCollabField('selected', null);

  const { revealed, waitingForAck, handleReveal, handleAck } = useFeedback({
    onAnswer: () => onAnswer(selected === exercise.answer, {
      statement: exercise.statement,
      studentAnswer: selected,
      correctAnswer: exercise.answer,
    }),
  });

  function handleSelect(value) {
    if (revealed) return;
    setSelected(value);
    handleReveal(value === exercise.answer);
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
              {label(val)}
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
      {waitingForAck && (
        <div className="got-it-bar">
          <button className="btn-primary" onClick={handleAck}>Got it</button>
        </div>
      )}
    </div>
  );
}
