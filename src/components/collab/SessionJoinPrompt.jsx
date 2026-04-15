export default function SessionJoinPrompt({ roomCode, onAccept, onDecline }) {
  return (
    <div className="session-join-overlay" role="dialog" aria-modal="true">
      <div className="session-join-card">
        <h2>Join tutoring session?</h2>
        <p>
          Your teacher is inviting you to session <strong>{roomCode}</strong>.
          They'll see what you're doing and you can work through exercises together.
        </p>
        <div className="session-join-actions">
          <button onClick={onDecline}>Cancel</button>
          <button onClick={onAccept} className="primary">Join</button>
        </div>
      </div>
    </div>
  );
}
