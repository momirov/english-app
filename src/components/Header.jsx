import { getProgress } from '../hooks/useProgress.js';

export default function Header({ title, onBack, unitColor }) {
  const progress = getProgress();
  const streak = progress.streakDays || 0;

  return (
    <header className="app-header" style={unitColor ? { borderBottomColor: unitColor } : {}}>
      <div className="header-left">
        {onBack && (
          <button className="back-btn" onClick={onBack} aria-label="Go back">
            ← Back
          </button>
        )}
        <span className="header-title">{title}</span>
      </div>
      <div className="header-right">
        {streak > 0 && (
          <div className="streak-badge" title={`${streak} day streak`}>
            🔥 {streak}
          </div>
        )}
      </div>
    </header>
  );
}
