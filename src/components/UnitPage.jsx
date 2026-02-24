import Header from './Header.jsx';
import { getLessonProgress } from '../hooks/useProgress.js';

const TYPE_ICONS = {
  vocabulary: '📚',
  grammar: '📝',
  listening: '🎧',
  speaking: '💬',
  writing: '✏️',
  review: '🔄',
};

export default function UnitPage({ unit, onSelectLesson, onBack }) {
  return (
    <div className="page">
      <Header title={unit.title} onBack={onBack} unitColor={unit.color} />
      <div className="unit-banner" style={{ background: unit.color }}>
        <span className="unit-banner-label">
          {unit.number === 0 ? 'Starter Unit' : `Unit ${unit.number}`}
        </span>
        <h1 className="unit-banner-title">{unit.title}</h1>
      </div>
      <main className="unit-page-main">
        <h2 className="lessons-heading">Lessons</h2>
        <div className="lesson-list">
          {unit.lessons.map((lesson, idx) => {
            const prog = getLessonProgress(lesson.id);
            const icon = TYPE_ICONS[lesson.type] || '📖';
            return (
              <button
                key={lesson.id}
                className={`lesson-row ${prog.completed ? 'completed' : ''}`}
                onClick={() => onSelectLesson(lesson.id)}
              >
                <span className="lesson-icon">{icon}</span>
                <div className="lesson-info">
                  <span className="lesson-number">
                    {unit.number === 0 ? 'Starter' : `${unit.number}.${idx + 1}`}
                  </span>
                  <span className="lesson-title">{lesson.title}</span>
                </div>
                <div className="lesson-status">
                  {prog.completed ? (
                    <span className="lesson-score" style={{ color: unit.color }}>
                      {prog.score}/{prog.total}
                    </span>
                  ) : (
                    <span className="lesson-arrow">›</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
