import UnitCard from './UnitCard.jsx';
import Header from './Header.jsx';

export default function UnitGrid({ title, units, onSelectUnit, onBack }) {
  return (
    <div className="page">
      <Header title={title} onBack={onBack} />
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
