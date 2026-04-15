import { useEffect, useState } from 'react';
import { Switch, Route, Redirect, useLocation, useParams } from 'wouter';
import './App.css';
import { allUnits } from './data/index.js';
import UnitGrid from './components/UnitGrid.jsx';
import UnitPage from './components/UnitPage.jsx';
import LessonPage from './components/LessonPage.jsx';
import SessionJoinPrompt from './components/collab/SessionJoinPrompt.jsx';
import SessionBanner from './components/collab/SessionBanner.jsx';
import { useSession } from './collab/useSession.jsx';
import { persistSessionMeta, clearSessionMeta, readSessionMeta } from './collab/recovery.js';

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
  const session = useSession();
  const [pendingJoinCode, setPendingJoinCode] = useState(null);

  // On mount: check URL for ?session=CODE, or localStorage for saved session.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('session');
    if (urlCode) {
      setPendingJoinCode(urlCode);
      return;
    }
    const saved = readSessionMeta();
    if (saved && session._manager) {
      if (saved.role === 'teacher') {
        session._manager.tryReconnect({ as: 'teacher', roomCode: saved.roomCode });
      } else {
        session._manager.tryReconnect({ as: 'student', roomCode: saved.roomCode });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When status becomes connected, persist meta. When it goes idle/error, clear.
  useEffect(() => {
    if (session.status === 'connected') {
      persistSessionMeta({ roomCode: session.roomCode, role: session.role, transport: 'webrtc' });
    } else if (session.status === 'idle' || session.status === 'error') {
      clearSessionMeta();
    }
  }, [session.status, session.roomCode, session.role]);

  async function acceptJoin() {
    try {
      await session.join({ roomCode: pendingJoinCode });
    } catch (e) {
      console.error('[collab] join failed', e);
    }
    setPendingJoinCode(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState({}, '', url.toString());
  }

  function declineJoin() {
    setPendingJoinCode(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState({}, '', url.toString());
  }

  return (
    <>
      <SessionBanner />
      {pendingJoinCode && (
        <SessionJoinPrompt
          roomCode={pendingJoinCode}
          onAccept={acceptJoin}
          onDecline={declineJoin}
        />
      )}
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/:unitId" component={UnitRoute} />
        <Route path="/:unitId/:lessonId" component={LessonRoute} />
        <Route path="/:unitId/:lessonId/:exerciseIdx" component={LessonRoute} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </>
  );
}
