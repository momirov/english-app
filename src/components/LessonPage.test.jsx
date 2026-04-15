import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock markLesson before importing LessonPage so the mock applies.
vi.mock('../hooks/useProgress.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, markLesson: vi.fn() };
});

import LessonPage from './LessonPage.jsx';
import { markLesson } from '../hooks/useProgress.js';
const markLessonMock = markLesson;
import { SessionProvider } from '../collab/useSession.jsx';
import { createSessionManager } from '../collab/session.js';
import { createMemoryTransportPair } from '../collab/transports/memory.js';

const lesson = {
  id: 'test-lesson-gating',
  title: 'Test',
  canDo: 'I can.',
  exercises: [{ type: 'flashcard', cards: [{ front: 'a', back: 'b' }] }],
};
const unit = { color: '#000' };

beforeEach(() => {
  if (typeof localStorage !== 'undefined' && typeof localStorage.clear === 'function') {
    localStorage.clear();
  }
  markLessonMock.mockClear();
});

function harness(mgr) {
  return render(
    <SessionProvider manager={mgr}>
      <LessonPage lesson={lesson} unit={unit} onBack={() => {}} initialIdx={0} />
    </SessionProvider>
  );
}

describe('LessonPage progress gating', () => {
  it('calls markLesson when no session is connected', async () => {
    const pair = createMemoryTransportPair('R');
    const mgr = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const user = userEvent.setup({ delay: null });
    harness(mgr);

    // Flashcard flow: Click flip button to flip the card
    const flipBtn = screen.getByRole('button', { name: /Flip/i });
    await user.click(flipBtn);

    // Wait for transition to complete and "Finish" button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Finish/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    const finishBtn = screen.getByRole('button', { name: /Finish/i });
    await user.click(finishBtn);

    // Wait for markLesson to be called
    await waitFor(() => {
      expect(markLessonMock).toHaveBeenCalled();
    }, { timeout: 3000 });

    expect(markLessonMock.mock.calls[0][0]).toBe('test-lesson-gating');
    expect(markLessonMock.mock.calls[0][2]).toBe(1);
  });

  it('does NOT call markLesson when session is connected', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });

    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await new Promise(r => setTimeout(r, 100)); // Wait for connection

    const user = userEvent.setup({ delay: null });
    harness(student);

    // Flashcard flow: Click flip button to flip the card
    const flipBtn = screen.getByRole('button', { name: /Flip/i });
    await user.click(flipBtn);

    // Wait for transition to complete and "Finish" button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Finish/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    const finishBtn = screen.getByRole('button', { name: /Finish/i });
    await user.click(finishBtn);

    // Ensure we reach the score screen to ensure the flow completed
    await waitFor(() => {
      expect(screen.queryByText(/All cards reviewed!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // markLesson should NOT have been called
    expect(markLessonMock).not.toHaveBeenCalled();
  });
});
