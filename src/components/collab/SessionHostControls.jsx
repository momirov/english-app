import { useState } from 'react';
import { useSession } from '../../collab/useSession.jsx';
import { generateRoomCode } from '../../collab/roomCode.js';

export default function SessionHostControls() {
  const session = useSession();
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setStarting(true);
    try {
      const code = generateRoomCode();
      await session.start({ as: 'teacher', roomCode: code });
    } catch (err) {
      console.error('[collab] failed to start session', err);
    } finally {
      setStarting(false);
    }
  }

  if (session.roomCode) {
    const url = `${window.location.origin}${window.location.pathname}?session=${session.roomCode}`;
    return (
      <div className="session-host-panel">
        <div>Share this link with your student:</div>
        <div data-testid="session-url" className="session-url">{url}</div>
        <button onClick={() => session.end()}>End session</button>
      </div>
    );
  }

  return (
    <button onClick={handleStart} disabled={starting}>
      {starting ? 'Starting…' : 'Start session'}
    </button>
  );
}
