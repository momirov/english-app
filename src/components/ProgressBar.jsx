export default function ProgressBar({ value, max, color = '#5c7cfa' }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
