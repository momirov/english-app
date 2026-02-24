const STORAGE_KEY = 'ep1_progress';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function defaultProgress() {
  return {
    version: 1,
    lastActive: null,
    streakDays: 0,
    lessons: {},
  };
}

export function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw);
  } catch {
    return defaultProgress();
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markLesson(lessonId, score, total) {
  const progress = getProgress();
  const today = getToday();

  // Update streak
  if (progress.lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (progress.lastActive === yesterdayStr) {
      progress.streakDays = (progress.streakDays || 0) + 1;
    } else {
      progress.streakDays = 1;
    }
    progress.lastActive = today;
  }

  const existing = progress.lessons[lessonId] || { attempts: 0 };
  progress.lessons[lessonId] = {
    completed: true,
    score,
    total,
    attempts: existing.attempts + 1,
  };

  saveProgress(progress);
  return progress;
}

export function getLessonProgress(lessonId) {
  const progress = getProgress();
  return progress.lessons[lessonId] || { completed: false, score: 0, total: 0 };
}

export function getUnitPercent(unitId, lessons) {
  const progress = getProgress();
  if (!lessons || lessons.length === 0) return 0;
  const completed = lessons.filter(l => progress.lessons[l.id]?.completed).length;
  return Math.round((completed / lessons.length) * 100);
}
