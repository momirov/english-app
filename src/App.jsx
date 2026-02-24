import { useState } from 'react';
import './App.css';
import { allUnits } from './data/index.js';
import UnitGrid from './components/UnitGrid.jsx';
import UnitPage from './components/UnitPage.jsx';
import LessonPage from './components/LessonPage.jsx';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'unit' | 'lesson'
  const [unitId, setUnitId] = useState(null);
  const [lessonId, setLessonId] = useState(null);

  const currentUnit = allUnits.find((u) => u.id === unitId);
  const currentLesson = currentUnit?.lessons.find((l) => l.id === lessonId);

  function goHome() {
    setView('home');
    setUnitId(null);
    setLessonId(null);
  }

  function goUnit(id) {
    setUnitId(id);
    setView('unit');
  }

  function goLesson(id) {
    setLessonId(id);
    setView('lesson');
  }

  if (view === 'lesson' && currentLesson && currentUnit) {
    return (
      <LessonPage
        lesson={currentLesson}
        unit={currentUnit}
        onBack={() => setView('unit')}
      />
    );
  }

  if (view === 'unit' && currentUnit) {
    return (
      <UnitPage
        unit={currentUnit}
        onSelectLesson={goLesson}
        onBack={goHome}
      />
    );
  }

  return <UnitGrid units={allUnits} onSelectUnit={goUnit} />;
}
