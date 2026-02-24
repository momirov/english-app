export default function ScoreScreen({ score, total, lessonTitle, onRetry, onBack }) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  let emoji, msg;
  if (pct === 100) { emoji = '🏆'; msg = 'Perfect score! Amazing work!'; }
  else if (pct >= 70) { emoji = '🌟'; msg = 'Great job! Keep it up!'; }
  else if (pct >= 50) { emoji = '👍'; msg = 'Good effort! Try again to improve.'; }
  else { emoji = '💪'; msg = 'Keep practising — you can do it!'; }

  return (
    <div className="score-screen">
      <div className="score-emoji">{emoji}</div>
      <h2 className="score-title">{lessonTitle}</h2>
      <div className="score-circle">
        <span className="score-number">{score}</span>
        <span className="score-denom">/ {total}</span>
      </div>
      <p className="score-pct">{pct}%</p>
      <p className="score-msg">{msg}</p>
      <div className="score-actions">
        <button className="btn-secondary" onClick={onRetry}>↩ Try again</button>
        <button className="btn-primary" onClick={onBack}>← Back to unit</button>
      </div>
    </div>
  );
}
