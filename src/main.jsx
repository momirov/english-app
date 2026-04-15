import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import './index.css';
import App from './App.jsx';
import { SessionProvider } from './collab/useSession.jsx';
import { getSessionManager } from './collab/singleton.js';

function Root() {
  const [manager, setManager] = useState(null);
  useEffect(() => {
    getSessionManager().then(setManager);
  }, []);
  if (!manager) return null;
  return (
    <SessionProvider manager={manager}>
      <Router hook={useHashLocation}>
        <App />
      </Router>
    </SessionProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
);
