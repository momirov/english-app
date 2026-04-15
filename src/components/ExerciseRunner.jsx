import { useState, useEffect } from 'react';
import { CollabScope } from '../collab/useCollabField.jsx';
import MultipleChoice from './exercises/MultipleChoice.jsx';
import FillBlank from './exercises/FillBlank.jsx';
import Matching from './exercises/Matching.jsx';
import TrueFalse from './exercises/TrueFalse.jsx';
import GrammarTable from './exercises/GrammarTable.jsx';
import Flashcard from './exercises/Flashcard.jsx';
import WordOrder from './exercises/WordOrder.jsx';
import ReadingComprehension from './exercises/ReadingComprehension.jsx';
import ProgressBar from './ProgressBar.jsx';

function ExerciseComponent({ exercise, onAnswer }) {
  switch (exercise.type) {
    case 'multiple-choice':
      return <MultipleChoice exercise={exercise} onAnswer={onAnswer} />;
    case 'fill-blank':
      return <FillBlank exercise={exercise} onAnswer={onAnswer} />;
    case 'matching':
      return <Matching exercise={exercise} onAnswer={onAnswer} />;
    case 'true-false':
      return <TrueFalse exercise={exercise} onAnswer={onAnswer} />;
    case 'grammar-table':
      return <GrammarTable exercise={exercise} onAnswer={onAnswer} />;
    case 'flashcard':
      return <Flashcard exercise={exercise} onAnswer={onAnswer} />;
    case 'word-order':
      return <WordOrder exercise={exercise} onAnswer={onAnswer} />;
    case 'reading-comprehension':
      return <ReadingComprehension exercise={exercise} onAnswer={onAnswer} />;
    default:
      return <p>Unknown exercise type: {exercise.type}</p>;
  }
}

export default function ExerciseRunner({ exercises, onComplete, initialIdx = 0, onIndexChange }) {
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (initialIdx != null && initialIdx !== currentIdx) {
      setCurrentIdx(initialIdx);
    }
    // Intentionally NOT depending on currentIdx — only react to prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIdx]);
  const [answers, setAnswers] = useState([]);
  const [transitioning, setTransitioning] = useState(false);

  const total = exercises.length;
  const current = exercises[currentIdx];

  function handleAnswer(correct, detail = null) {
    const increment = detail?.proportional
      ? detail.proportional.correct / detail.proportional.total
      : correct ? 1 : 0;
    const newScore = score + increment;
    const newAnswers = [...answers, { exercise: current, correct, detail }];
    setScore(newScore);
    setAnswers(newAnswers);
    setTransitioning(true);
    setTimeout(() => {
      setTransitioning(false);
      if (currentIdx + 1 >= total) {
        onComplete(newScore, total, newAnswers);
      } else {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        onIndexChange?.(nextIdx);
      }
    }, 400);
  }

  return (
    <div className="exercise-runner">
      <div className="runner-header">
        <span className="runner-count">
          {currentIdx + 1} / {total}
        </span>
        <ProgressBar value={currentIdx} max={total} />
      </div>
      <div className={`runner-content ${transitioning ? 'fading' : ''}`}>
        <CollabScope exerciseIndex={currentIdx}>
          <ExerciseComponent key={currentIdx} exercise={current} onAnswer={handleAnswer} />
        </CollabScope>
      </div>
    </div>
  );
}
