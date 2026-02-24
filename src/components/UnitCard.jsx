import ProgressBar from './ProgressBar.jsx';
import { getUnitPercent } from '../hooks/useProgress.js';

export default function UnitCard({ unit, onClick }) {
  const pct = getUnitPercent(unit.id, unit.lessons);

  return (
    <button className="unit-card" onClick={onClick} style={{ '--unit-color': unit.color }}>
      <div className="unit-card-header" style={{ background: unit.color }}>
        <span className="unit-number">
          {unit.number === 0 ? 'Starter' : `Unit ${unit.number}`}
        </span>
        {pct === 100 && <span className="unit-complete-badge">✓</span>}
      </div>
      <div className="unit-card-body">
        <h3 className="unit-card-title">{unit.title}</h3>
        <div className="unit-card-meta">
          <span className="unit-lesson-count">{unit.lessons.length} lessons</span>
          <span className="unit-pct">{pct}%</span>
        </div>
        <ProgressBar value={pct} max={100} color={unit.color} />
      </div>
    </button>
  );
}
