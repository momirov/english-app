import { Switch, Route, Redirect, useLocation, useParams } from 'wouter';
import './App.css';
import { books, findBook, legacyRedirectTarget } from './data/books.js';
import BookGrid from './components/BookGrid.jsx';
import UnitGrid from './components/UnitGrid.jsx';
import UnitPage from './components/UnitPage.jsx';
import LessonPage from './components/LessonPage.jsx';

function HomeRoute() {
  const [, navigate] = useLocation();
  return <BookGrid books={books} onSelectBook={(id) => navigate(`/${id}`)} />;
}

// First path segment isn't a book: either a pre-book Book 1 URL or junk.
function LegacyRedirect() {
  const [location] = useLocation();
  return <Redirect to={legacyRedirectTarget(location)} replace />;
}

function BookRoute() {
  const { bookId } = useParams();
  const [, navigate] = useLocation();
  const book = findBook(bookId);
  if (!book) return <LegacyRedirect />;
  return (
    <UnitGrid
      title={book.title}
      units={book.units}
      onSelectUnit={(id) => navigate(`/${bookId}/${id}`)}
      onBack={() => navigate('/')}
    />
  );
}

function UnitRoute() {
  const { bookId, unitId } = useParams();
  const [, navigate] = useLocation();
  const book = findBook(bookId);
  if (!book) return <LegacyRedirect />;
  const unit = book.units.find((u) => u.id === unitId);
  if (!unit) return <Redirect to={`/${bookId}`} replace />;
  return (
    <UnitPage
      unit={unit}
      onSelectLesson={(id) => navigate(`/${bookId}/${unitId}/${id}`)}
      onBack={() => navigate(`/${bookId}`)}
    />
  );
}

function LessonRoute() {
  const { bookId, unitId, lessonId, exerciseIdx } = useParams();
  const [, navigate] = useLocation();
  const book = findBook(bookId);
  if (!book) return <LegacyRedirect />;
  const unit = book.units.find((u) => u.id === unitId);
  const lesson = unit?.lessons.find((l) => l.id === lessonId);
  if (!unit || !lesson) return <Redirect to={`/${bookId}`} replace />;

  let initialIdx;
  if (exerciseIdx !== undefined) {
    const parsed = parseInt(exerciseIdx, 10);
    initialIdx = isNaN(parsed)
      ? 0
      : Math.min(Math.max(parsed, 0), lesson.exercises.length - 1);
  }

  const base = `/${bookId}/${unitId}/${lessonId}`;
  return (
    <LessonPage
      lesson={lesson}
      unit={unit}
      onBack={() => navigate(`/${bookId}/${unitId}`)}
      initialIdx={initialIdx}
      onStart={() => navigate(`${base}/0`)}
      onExerciseChange={(idx) => navigate(`${base}/${idx}`, { replace: true })}
    />
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/:bookId" component={BookRoute} />
      <Route path="/:bookId/:unitId" component={UnitRoute} />
      <Route path="/:bookId/:unitId/:lessonId" component={LessonRoute} />
      <Route path="/:bookId/:unitId/:lessonId/:exerciseIdx" component={LessonRoute} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
