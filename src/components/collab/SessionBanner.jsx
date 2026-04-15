import { useEffect, useState } from 'react';
import { useSession } from '../../collab/useSession.jsx';

export default function SessionBanner() {
  const { status } = useSession();
  const [dismissedErr, setDismissedErr] = useState(false);

  // Auto-dismiss the error banner after 5s.
  useEffect(() => {
    if (status !== 'error') { setDismissedErr(false); return; }
    const t = setTimeout(() => setDismissedErr(true), 5000);
    return () => clearTimeout(t);
  }, [status]);

  if (status === 'idle') return null;
  if (status === 'error' && dismissedErr) return null;

  const cfg = {
    connecting: { cls: 'connecting', text: '◌ Connecting…' },
    connected: { cls: 'connected', text: '● Live with teacher' },
    'peer-gone': { cls: 'peer-gone', text: '◌ Waiting for teacher — you can keep practicing' },
    error: { cls: 'error', text: '✕ Session ended — practicing solo' },
  }[status];

  if (!cfg) return null;

  return (
    <div data-testid="session-banner" className={`session-banner ${cfg.cls}`}>
      {cfg.text}
    </div>
  );
}
