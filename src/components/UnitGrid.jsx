import UnitCard from './UnitCard.jsx';
import Header from './Header.jsx';

export default function UnitGrid({ units, onSelectUnit }) {
  return (
    <div className="page">
      <Header title="English Plus 1" />
      <main className="unit-grid-main">
        <p className="home-subtitle">Choose a unit to start learning</p>
        <div className="unit-grid">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} onClick={() => onSelectUnit(unit.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}
