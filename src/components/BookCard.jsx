import ProgressBar from './ProgressBar.jsx';
import { getBookPercent } from '../hooks/useProgress.js';

export default function BookCard({ book, onClick }) {
  const pct = getBookPercent(book.units);
  const unitCount = book.units.filter((u) => u.number != null).length;

  return (
    <button className="unit-card" onClick={onClick} style={{ '--unit-color': book.color }}>
      <div className="unit-card-header" style={{ background: book.color }}>
        <span className="unit-number">{book.level}</span>
        {pct === 100 && <span className="unit-complete-badge">✓</span>}
      </div>
      <div className="unit-card-body">
        <h3 className="unit-card-title">{book.title}</h3>
        <div className="unit-card-meta">
          <span className="unit-lesson-count">{unitCount} units</span>
          <span className="unit-pct">{pct}%</span>
        </div>
        <ProgressBar value={pct} max={100} color={book.color} />
      </div>
    </button>
  );
}
