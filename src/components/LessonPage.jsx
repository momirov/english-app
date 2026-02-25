import { useState } from 'react';
import Header from './Header.jsx';
import ExerciseRunner from './ExerciseRunner.jsx';
import ScoreScreen from './ScoreScreen.jsx';
import { markLesson } from '../hooks/useProgress.js';

export default function LessonPage({ lesson, unit, onBack, initialIdx, onStart, onExerciseChange }) {
  const [phase, setPhase] = useState(initialIdx !== undefined ? 'exercises' : 'intro'); // intro | exercises | score
  const [finalScore, setFinalScore] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [finalAnswers, setFinalAnswers] = useState([]);

  function handleStart() {
    onStart?.();
    setPhase('exercises');
  }

  function handleComplete(score, total, answers) {
    markLesson(lesson.id, score, total);
    setFinalScore(score);
    setFinalTotal(total);
    setFinalAnswers(answers);
    setPhase('score');
  }

  function handleRetry() {
    onStart?.();
    setFinalAnswers([]);
    setPhase('exercises');
  }

  if (phase === 'intro') {
    return (
      <div className="page">
        <Header title={lesson.title} onBack={onBack} unitColor={unit.color} />
        <main className="lesson-intro">
          <div className="cando-card" style={{ borderColor: unit.color }}>
            <span className="cando-label">Learning goal</span>
            <p className="cando-text">{lesson.canDo}</p>
          </div>
          <div className="intro-meta">
            <span>{lesson.exercises.length} exercises</span>
          </div>
          <button
            className="start-btn"
            style={{ background: unit.color }}
            onClick={handleStart}
          >
            Start lesson →
          </button>
        </main>
      </div>
    );
  }

  if (phase === 'score') {
    return (
      <div className="page">
        <Header title={lesson.title} onBack={onBack} unitColor={unit.color} />
        <main className="lesson-score-wrap">
          <ScoreScreen
            score={finalScore}
            total={finalTotal}
            lessonTitle={lesson.title}
            answers={finalAnswers}
            onRetry={handleRetry}
            onBack={onBack}
          />
        </main>
      </div>
    );
  }

  // exercises phase
  return (
    <div className="page">
      <Header title={lesson.title} onBack={onBack} unitColor={unit.color} />
      <main className="lesson-exercises">
        <ExerciseRunner
          exercises={lesson.exercises}
          onComplete={handleComplete}
          initialIdx={initialIdx}
          onIndexChange={onExerciseChange}
        />
      </main>
    </div>
  );
}
