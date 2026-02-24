import { Switch, Route, Redirect, useLocation, useParams } from 'wouter';
import './App.css';
import { allUnits } from './data/index.js';
import UnitGrid from './components/UnitGrid.jsx';
import UnitPage from './components/UnitPage.jsx';
import LessonPage from './components/LessonPage.jsx';

function HomeRoute() {
  const [, navigate] = useLocation();
  return <UnitGrid units={allUnits} onSelectUnit={(id) => navigate(`/${id}`)} />;
}

function UnitRoute() {
  const { unitId } = useParams();
  const [, navigate] = useLocation();
  const unit = allUnits.find((u) => u.id === unitId);
  if (!unit) return <Redirect to="/" />;
  return (
    <UnitPage
      unit={unit}
      onSelectLesson={(id) => navigate(`/${unitId}/${id}`)}
      onBack={() => navigate('/')}
    />
  );
}

function LessonRoute() {
  const { unitId, lessonId, exerciseIdx } = useParams();
  const [, navigate] = useLocation();
  const unit = allUnits.find((u) => u.id === unitId);
  const lesson = unit?.lessons.find((l) => l.id === lessonId);
  if (!unit || !lesson) return <Redirect to="/" />;

  let initialIdx;
  if (exerciseIdx !== undefined) {
    const parsed = parseInt(exerciseIdx, 10);
    initialIdx = isNaN(parsed)
      ? 0
      : Math.min(Math.max(parsed, 0), lesson.exercises.length - 1);
  }

  return (
    <LessonPage
      lesson={lesson}
      unit={unit}
      onBack={() => navigate(`/${unitId}`)}
      initialIdx={initialIdx}
      onStart={() => navigate(`/${unitId}/${lessonId}/0`)}
      onExerciseChange={(idx) => navigate(`/${unitId}/${lessonId}/${idx}`, { replace: true })}
    />
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/:unitId" component={UnitRoute} />
      <Route path="/:unitId/:lessonId" component={LessonRoute} />
      <Route path="/:unitId/:lessonId/:exerciseIdx" component={LessonRoute} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
