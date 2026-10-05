# English Plus 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a book picker to the app and a full set of exercises for the English Plus 2 Student's Book (Starter + Units 1–8).

**Architecture:** A new `src/data/books.js` registry wraps Book 1's existing `allUnits` and a new `src/data/ep2/` unit list. Routes gain a leading `/:bookId` segment; legacy Book 1 URLs redirect to `/ep1/...`. Book 2 content is plain data files in the existing exercise schema, guarded by a data-integrity test suite.

**Tech Stack:** React 19, Vite 7, wouter 3 (hash location), Vitest 4 + Testing Library, jsdom.

**Spec:** `docs/superpowers/specs/2026-10-05-english-plus-2-design.md`

**Source PDF:** `english_plus_2_SB_2nd_ed.pdf` — **PDF page = book page + 1** (book p8 is PDF page 9). Read with the Read tool, `pages: "9-16"`, max 20 pages per call.

**Deviation from spec (intentional):** `src/data/index.js` keeps exporting `allUnits` as Book 1's unit list (it is imported by `irregular.test.js`); `books.js` wraps it rather than replacing it.

---

## File structure

| File | Status | Responsibility |
|---|---|---|
| `src/data/books.js` | create | `books` registry, `findBook(id)`, `legacyRedirectTarget(path)` |
| `src/data/books.test.js` | create | registry + redirect helper tests |
| `src/data/ep2/index.js` | create | ordered `ep2Units` array |
| `src/data/ep2/ep2.test.js` | create | Book 2 data-integrity tests |
| `src/data/ep2/starter.js`, `unit1.js` … `unit8.js` | create | Book 2 unit content |
| `src/hooks/useProgress.js` | modify | add `getBookPercent(units)` |
| `src/components/BookCard.jsx` | create | one book card (reuses `.unit-card` CSS) |
| `src/components/BookGrid.jsx` | create | home screen: book picker |
| `src/components/UnitGrid.jsx` | modify | accept `title` + `onBack` props |
| `src/App.jsx` | modify | book-scoped routes + legacy redirect |
| `src/App.test.jsx` | create | routing tests |
| `README.md` | modify | describe both books + new data layout |

---

### Task 1: Book 2 data scaffold + integrity tests

**Files:**
- Create: `src/data/ep2/index.js`
- Create: `src/data/ep2/ep2.test.js`

- [ ] **Step 1: Create the empty unit list**

`src/data/ep2/index.js`:
```js
export const ep2Units = [];
```

- [ ] **Step 2: Write the integrity test suite**

`src/data/ep2/ep2.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { ep2Units } from './index.js';
import { allUnits as ep1Units } from '../index.js';

// Grows by one id per content task.
const EXPECTED_UNIT_IDS = [];

const STARTER_SUFFIXES = ['vocab1', 'grammar1', 'vocab2', 'grammar2'];
const UNIT_SUFFIXES = ['vocab1', 'reading', 'grammar1', 'vocab2', 'grammar2', 'speaking', 'writing'];
const LESSON_TYPE_BY_SUFFIX = {
  vocab1: 'vocabulary',
  vocab2: 'vocabulary',
  reading: 'reading',
  grammar1: 'grammar',
  grammar2: 'grammar',
  speaking: 'speaking',
  writing: 'writing',
};

const lessons = ep2Units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));
const exercises = lessons.flatMap(({ unit, lesson }) =>
  lesson.exercises.map((ex, i) => ({ unit, lesson, ex, where: `${lesson.id}[${i}]` }))
);
const ofType = (type) => exercises.filter(({ ex }) => ex.type === type);

describe('ep2 — units', () => {
  it('registers the expected units in order', () => {
    expect(ep2Units.map((u) => u.id)).toEqual(EXPECTED_UNIT_IDS);
  });

  it('each unit has id, integer number, title and hex color', () => {
    ep2Units.forEach((u) => {
      expect(Number.isInteger(u.number), u.id).toBe(true);
      expect(u.title, u.id).toBeTruthy();
      expect(u.color, u.id).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('each unit has the standard lesson sequence', () => {
    ep2Units.forEach((u) => {
      const expected = (u.number === 0 ? STARTER_SUFFIXES : UNIT_SUFFIXES).map((s) => `ep2-${u.id}-${s}`);
      expect(u.lessons.map((l) => l.id)).toEqual(expected);
    });
  });
});

describe('ep2 — lessons', () => {
  it('lesson ids are unique and never collide with Book 1', () => {
    const ids = lessons.map(({ lesson }) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    const ep1Ids = new Set(ep1Units.flatMap((u) => u.lessons.map((l) => l.id)));
    ids.forEach((id) => expect(ep1Ids.has(id), id).toBe(false));
  });

  it('each lesson has title, canDo, matching type, and at least 4 exercises', () => {
    lessons.forEach(({ lesson }) => {
      const suffix = lesson.id.split('-').pop();
      expect(lesson.type, lesson.id).toBe(LESSON_TYPE_BY_SUFFIX[suffix]);
      expect(lesson.title, lesson.id).toBeTruthy();
      expect(lesson.canDo, lesson.id).toMatch(/^I can /);
      expect(lesson.exercises.length, lesson.id).toBeGreaterThanOrEqual(4);
    });
  });
});

describe('ep2 — exercise integrity', () => {
  it('fill-blank: one ___, 3–4 unique wordBank entries containing the answer', () => {
    ofType('fill-blank').forEach(({ ex, where }) => {
      expect((ex.template.match(/___/g) || []).length, where).toBe(1);
      expect(ex.wordBank.length, where).toBeGreaterThanOrEqual(3);
      expect(ex.wordBank.length, where).toBeLessThanOrEqual(4);
      expect(new Set(ex.wordBank).size, where).toBe(ex.wordBank.length);
      expect(ex.wordBank, where).toContain(ex.answer);
    });
  });

  it('multiple-choice: 3–4 unique options containing the answer', () => {
    ofType('multiple-choice').forEach(({ ex, where }) => {
      expect(ex.question, where).toBeTruthy();
      expect(ex.options.length, where).toBeGreaterThanOrEqual(3);
      expect(ex.options.length, where).toBeLessThanOrEqual(4);
      expect(new Set(ex.options).size, where).toBe(ex.options.length);
      expect(ex.options, where).toContain(ex.answer);
    });
  });

  it('multiple-choice: correct-answer position varies within a lesson (3+ MC items)', () => {
    lessons.forEach(({ lesson }) => {
      const mc = lesson.exercises.filter((ex) => ex.type === 'multiple-choice');
      if (mc.length < 3) return;
      const positions = new Set(mc.map((ex) => ex.options.indexOf(ex.answer)));
      expect(positions.size, lesson.id).toBeGreaterThan(1);
    });
  });

  it('matching: 3+ pairs, non-empty, unique left items', () => {
    ofType('matching').forEach(({ ex, where }) => {
      expect(ex.pairs.length, where).toBeGreaterThanOrEqual(3);
      ex.pairs.forEach((p) => {
        expect(p.left, where).toBeTruthy();
        expect(p.right, where).toBeTruthy();
      });
      const lefts = ex.pairs.map((p) => p.left);
      expect(new Set(lefts).size, where).toBe(lefts.length);
    });
  });

  it('flashcard: 4+ cards with non-empty front/back, unique fronts', () => {
    ofType('flashcard').forEach(({ ex, where }) => {
      expect(ex.cards.length, where).toBeGreaterThanOrEqual(4);
      ex.cards.forEach((c) => {
        expect(c.front, where).toBeTruthy();
        expect(c.back, where).toBeTruthy();
      });
      const fronts = ex.cards.map((c) => c.front);
      expect(new Set(fronts).size, where).toBe(fronts.length);
    });
  });

  it('word-order: lowercase words; answer is a permutation of words', () => {
    ofType('word-order').forEach(({ ex, where }) => {
      ex.words.forEach((w) => expect(w, where).toBe(w.toLowerCase()));
      const sortedW = ex.words.map((w) => w.toLowerCase()).sort();
      const sortedA = ex.answer.map((w) => w.toLowerCase()).sort();
      expect(sortedA, where).toEqual(sortedW);
    });
  });

  it('true-false: statement string + boolean answer', () => {
    ofType('true-false').forEach(({ ex, where }) => {
      expect(ex.statement, where).toBeTruthy();
      expect(typeof ex.answer, where).toBe('boolean');
    });
  });

  it('grammar-table: title, promptLabel, non-empty rows', () => {
    ofType('grammar-table').forEach(({ ex, where }) => {
      expect(ex.title, where).toBeTruthy();
      expect(ex.promptLabel, where).toBeTruthy();
      expect(ex.rows.length, where).toBeGreaterThan(0);
      ex.rows.forEach((r) => {
        expect(r.prompt, where).toBeTruthy();
        expect(r.answer, where).toBeTruthy();
      });
    });
  });

  it('reading-comprehension: substantial passage, 4+ well-formed questions', () => {
    ofType('reading-comprehension').forEach(({ ex, where }) => {
      expect(ex.passage.length, where).toBeGreaterThan(400);
      expect(ex.questions.length, where).toBeGreaterThanOrEqual(4);
      ex.questions.forEach((q) => {
        expect(q.question, where).toBeTruthy();
        expect(new Set(q.options).size, where).toBe(q.options.length);
        expect(q.options, where).toContain(q.answer);
      });
    });
  });

  it('each reading lesson contains a reading-comprehension exercise', () => {
    lessons
      .filter(({ lesson }) => lesson.type === 'reading')
      .forEach(({ lesson }) => {
        expect(lesson.exercises.some((ex) => ex.type === 'reading-comprehension'), lesson.id).toBe(true);
      });
  });
});
```

- [ ] **Step 3: Run the tests**

Run: `npx vitest run src/data/ep2`
Expected: PASS (all tests trivially pass against an empty list; they start biting when units are added).

- [ ] **Step 4: Commit**

```bash
git add src/data/ep2/index.js src/data/ep2/ep2.test.js
git commit -m "test: Book 2 data scaffold + integrity suite"
```

---

### Task 2: Book registry + legacy redirect helper

**Files:**
- Create: `src/data/books.js`
- Test: `src/data/books.test.js`

- [ ] **Step 1: Write the failing test**

`src/data/books.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { books, findBook, legacyRedirectTarget } from './books.js';
import { allUnits } from './index.js';
import { irregular } from './irregular.js';

describe('books registry', () => {
  it('lists Book 1 then Book 2', () => {
    expect(books.map((b) => b.id)).toEqual(['ep1', 'ep2']);
    expect(books.map((b) => b.title)).toEqual(['English Plus 1', 'English Plus 2']);
  });

  it('Book 1 uses the existing allUnits list', () => {
    expect(findBook('ep1').units).toBe(allUnits);
  });

  it('Irregular verbs is the last unit of both books (same object)', () => {
    books.forEach((b) => expect(b.units[b.units.length - 1]).toBe(irregular));
  });

  it('every book has level and hex color', () => {
    books.forEach((b) => {
      expect(b.level).toBeTruthy();
      expect(b.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('findBook returns undefined for unknown ids', () => {
    expect(findBook('nope')).toBeUndefined();
  });
});

describe('legacyRedirectTarget', () => {
  it('prefixes Book 1 unit paths with /ep1', () => {
    expect(legacyRedirectTarget('/unit5')).toBe('/ep1/unit5');
    expect(legacyRedirectTarget('/unit5/unit5-vocab1/3')).toBe('/ep1/unit5/unit5-vocab1/3');
    expect(legacyRedirectTarget('/starter')).toBe('/ep1/starter');
    expect(legacyRedirectTarget('/irregular/irregular-1')).toBe('/ep1/irregular/irregular-1');
  });

  it('sends unknown paths home', () => {
    expect(legacyRedirectTarget('/nope')).toBe('/');
    expect(legacyRedirectTarget('/nope/unit5')).toBe('/');
    expect(legacyRedirectTarget('/')).toBe('/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/books.test.js`
Expected: FAIL — cannot resolve `./books.js`.

- [ ] **Step 3: Implement**

`src/data/books.js`:
```js
import { allUnits as ep1Units } from './index.js';
import { irregular } from './irregular.js';
import { ep2Units } from './ep2/index.js';

export const books = [
  { id: 'ep1', title: 'English Plus 1', level: 'A1–A2', color: '#2980b9', units: ep1Units },
  { id: 'ep2', title: 'English Plus 2', level: 'A2', color: '#c0392b', units: [...ep2Units, irregular] },
];

export function findBook(id) {
  return books.find((b) => b.id === id);
}

// Pre-book URLs looked like /unit5/unit5-vocab1/3. Map them onto Book 1.
export function legacyRedirectTarget(path) {
  const first = path.split('/').filter(Boolean)[0];
  if (first && findBook('ep1').units.some((u) => u.id === first)) return `/ep1${path}`;
  return '/';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/books.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/books.js src/data/books.test.js
git commit -m "feat: books registry with legacy Book 1 URL mapping"
```

---

### Task 3: Book progress + BookCard + BookGrid

**Files:**
- Modify: `src/hooks/useProgress.js` (append function)
- Create: `src/components/BookCard.jsx`, `src/components/BookGrid.jsx`
- Test: `src/components/BookCard.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/components/BookCard.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookCard from './BookCard';
import { markLesson } from '../hooks/useProgress.js';

beforeEach(() => {
  localStorage.clear();
});

const book = {
  id: 'b',
  title: 'English Plus 9',
  level: 'B2',
  color: '#123456',
  units: [
    { id: 'u1', number: 1, lessons: [{ id: 'b-1' }, { id: 'b-2' }] },
    { id: 'u2', number: 2, lessons: [{ id: 'b-3' }, { id: 'b-4' }] },
    { id: 'extra', number: null, lessons: [] },
  ],
};

describe('BookCard', () => {
  it('shows title, level and numbered-unit count', () => {
    render(<BookCard book={book} onClick={vi.fn()} />);
    expect(screen.getByText('English Plus 9')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    expect(screen.getByText('2 units')).toBeInTheDocument();
  });

  it('shows percent of lessons completed across all units', () => {
    markLesson('b-1', 1, 1);
    render(<BookCard book={book} onClick={vi.fn()} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/BookCard.test.jsx`
Expected: FAIL — cannot resolve `./BookCard`.

- [ ] **Step 3: Add `getBookPercent` to `src/hooks/useProgress.js`** (append at end of file)

```js
export function getBookPercent(units) {
  const progress = getProgress();
  const lessons = units.flatMap(u => u.lessons);
  if (lessons.length === 0) return 0;
  const completed = lessons.filter(l => progress.lessons[l.id]?.completed).length;
  return Math.round((completed / lessons.length) * 100);
}
```

- [ ] **Step 4: Create `src/components/BookCard.jsx`**

```jsx
import ProgressBar from './ProgressBar.jsx';
import { getBookPercent } from '../hooks/useProgress.js';

export default function BookCard({ book, onClick }) {
  const pct = getBookPercent(book.units);
  const unitCount = book.units.filter((u) => u.number != null).length;

  return (
    <button className="unit-card" onClick={onClick} style={{ '--unit-color': book.color }}>
      <div className="unit-card-header" style={{ background: book.color }}>
        <span className="unit-number">{book.level}</span>
        {pct === 100 && <span className="unit-complete-badge">✓</span>}
      </div>
      <div className="unit-card-body">
        <h3 className="unit-card-title">{book.title}</h3>
        <div className="unit-card-meta">
          <span className="unit-lesson-count">{unitCount} units</span>
          <span className="unit-pct">{pct}%</span>
        </div>
        <ProgressBar value={pct} max={100} color={book.color} />
      </div>
    </button>
  );
}
```

- [ ] **Step 5: Create `src/components/BookGrid.jsx`**

```jsx
import BookCard from './BookCard.jsx';
import Header from './Header.jsx';

export default function BookGrid({ books, onSelectBook }) {
  return (
    <div className="page">
      <Header title="English Plus" />
      <main className="unit-grid-main">
        <p className="home-subtitle">Choose a book</p>
        <div className="unit-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onClick={() => onSelectBook(book.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/components/BookCard.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useProgress.js src/components/BookCard.jsx src/components/BookGrid.jsx src/components/BookCard.test.jsx
git commit -m "feat: BookGrid + BookCard with book-level progress"
```

---

### Task 4: Book-scoped routing

**Files:**
- Modify: `src/components/UnitGrid.jsx`
- Modify: `src/App.jsx` (full rewrite)
- Test: `src/App.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/App.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import App from './App.jsx';

beforeEach(() => {
  localStorage.clear();
});

function renderAt(path) {
  const loc = memoryLocation({ path, record: true });
  render(
    <Router hook={loc.hook}>
      <App />
    </Router>
  );
  return loc;
}

const current = (loc) => loc.history[loc.history.length - 1];

describe('App routing', () => {
  it('home shows both books', () => {
    renderAt('/');
    expect(screen.getByText('English Plus 1')).toBeInTheDocument();
    expect(screen.getByText('English Plus 2')).toBeInTheDocument();
  });

  it('clicking a book opens its unit grid', async () => {
    const loc = renderAt('/');
    await userEvent.click(screen.getByText('English Plus 1'));
    expect(current(loc)).toBe('/ep1');
    expect(screen.getByText('Food and health')).toBeInTheDocument();
  });

  it('/ep2 shows Book 2 grid with Irregular verbs', () => {
    renderAt('/ep2');
    expect(screen.getByText('English Plus 2')).toBeInTheDocument();
    expect(screen.getByText('Irregular verbs')).toBeInTheDocument();
  });

  it('back from a unit grid goes to the book picker', async () => {
    const loc = renderAt('/ep1');
    await userEvent.click(screen.getByLabelText('Go back'));
    expect(current(loc)).toBe('/');
  });

  it('/ep1/unit5 shows the unit page; back goes to /ep1', async () => {
    const loc = renderAt('/ep1/unit5');
    expect(screen.getByRole('heading', { name: 'Food and health' })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Go back'));
    expect(current(loc)).toBe('/ep1');
  });

  it('redirects legacy /unit5 to /ep1/unit5', () => {
    const loc = renderAt('/unit5');
    expect(current(loc)).toBe('/ep1/unit5');
    expect(screen.getByRole('heading', { name: 'Food and health' })).toBeInTheDocument();
  });

  it('redirects legacy lesson URLs', () => {
    const loc = renderAt('/unit5/unit5-vocab1/2');
    expect(current(loc)).toBe('/ep1/unit5/unit5-vocab1/2');
  });

  it('unknown book sends you home', () => {
    const loc = renderAt('/nope');
    expect(current(loc)).toBe('/');
  });

  it('unknown unit inside a book goes to that book', () => {
    const loc = renderAt('/ep2/unit99');
    expect(current(loc)).toBe('/ep2');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL — home renders the Book 1 unit grid, not book titles.

- [ ] **Step 3: Update `src/components/UnitGrid.jsx`**

```jsx
import UnitCard from './UnitCard.jsx';
import Header from './Header.jsx';

export default function UnitGrid({ title, units, onSelectUnit, onBack }) {
  return (
    <div className="page">
      <Header title={title} onBack={onBack} />
      <main className="unit-grid-main">
        <p className="home-subtitle">Choose a unit to start learning</p>
        <div className="unit-grid">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} onClick={() => onSelectUnit(unit.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `src/App.jsx`**

```jsx
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
```

Note on `replace` redirects + `memoryLocation({ record: true })`: if `history` does not reflect a replace as the last entry, switch the `current()` helper in the test to read `loc.hook()[0]` via a tiny probe component instead — but try the simple version first.

- [ ] **Step 5: Run the full suite**

Run: `npx vitest run`
Expected: PASS — all previous 80 tests plus the new ones.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/components/UnitGrid.jsx
git commit -m "feat: book picker routing (/:bookId/...) with legacy Book 1 redirects"
```

---

## Authoring guide for Book 2 units (used by Tasks 5–13)

### Unit file template

```js
// src/data/ep2/unitN.js
export const ep2UnitN = {
  id: 'unitN',
  number: N,
  title: '<book unit title>',
  color: '<hex from the table in the task>',
  lessons: [
    {
      id: 'ep2-unitN-vocab1',
      type: 'vocabulary',
      title: '<topic from the book page header>',
      canDo: 'I can <book "I can…" line, lightly edited>.',
      exercises: [ /* ... */ ],
    },
    // ep2-unitN-reading     type 'reading'
    // ep2-unitN-grammar1    type 'grammar'
    // ep2-unitN-vocab2      type 'vocabulary'
    // ep2-unitN-grammar2    type 'grammar'
    // ep2-unitN-speaking    type 'speaking'
    // ep2-unitN-writing     type 'writing'
  ],
};
```

Starter uses `id: 'starter'`, `number: 0`, export `ep2Starter`, and only `vocab1, grammar1, vocab2, grammar2`.

### Exercise shapes (existing components — do not invent new types)

```js
{ type: 'flashcard', cards: [{ front: 'word', back: '🎯 short definition' }] }
{ type: 'matching', pairs: [{ left: 'unique item', right: 'category / match' }] }   // left must be unique
{ type: 'multiple-choice', question: '…', options: ['a', 'b', 'c', 'd'], answer: 'b' }
{ type: 'fill-blank', template: 'She ___ to school.', wordBank: ['go', 'goes', 'going', 'went'], answer: 'goes' }
{ type: 'true-false', statement: '…', answer: true }
{ type: 'word-order', words: ['school', 'goes', 'she', 'to', '.'], answer: ['She', 'goes', 'to', 'school', '.'] } // words all lowercase
{ type: 'grammar-table', title: '…', promptLabel: 'Subject', rows: [{ prompt: 'he', answer: 'plays' }] }
{ type: 'reading-comprehension', passage: 'para 1\n\npara 2', questions: [{ question: '…', options: ['x', 'y', 'z'], answer: 'y' }] }
```

### Lesson recipes (aim 8–15 exercises per lesson)

| Lesson | Recipe |
|---|---|
| `vocab1` | 1 flashcard (all words from the page's main word box, emoji + short definition), 1–2 matching (word ↔ category/meaning/opposite), 4–6 MC or fill-blank using the words in context, key-phrases page box as 2–3 fill-blank/MC. Include the **Remember!** box content (e.g. prepositions *in bed / at school / on the bus*). |
| `reading` | 1 reading-comprehension: **original** 180–280-word text on the book's reading topic and in the same genre (forum, article, blog…), using the unit's vocabulary and grammar; 5–6 questions. Then 1 flashcard of the *Vocabulary plus* words + 3–5 fill-blank/MC using them. |
| `grammar1` / `grammar2` | 1 grammar-table summarising the book's RULES box, 1–3 true-false about the rules, 6–10 fill-blank (verb forms, choose-the-word), 2–3 word-order, MC for contrasts (e.g. present simple vs continuous). Include the **Remember!** spelling/form notes. |
| `vocab2` | 1 flashcard, 1 matching (collocations: verb ↔ noun etc.), 6–10 fill-blank/MC in context. |
| `speaking` | Key phrases from the Speaking box: matching (phrase ↔ function, or question ↔ response), 4–6 MC "Which phrase…?" / choose-the-correct-option (mirrors the book's "Choose the correct phrases" exercise with new sentences), 2–3 word-order of key phrases, a fill-blank dialogue line or two. |
| `writing` | Key phrases from the Writing box (fill-blank), the **Language point** (e.g. *and/also/too*, *but/however*, sequencing words) as 5–8 fill-blank/MC, 1–2 word-order. |

### Content rules

- Grammar rules, word lists and key phrases follow the book. Example sentences, dialogues and reading texts are **newly written** — don't copy book sentences verbatim.
- British spelling (colour, favourite, practise as a verb).
- Vary MC answer positions (test enforces this for lessons with 3+ MC items; aim for an even spread).
- Distractors must be clearly wrong for an A2 learner — no two defensible answers.
- One `___` per fill-blank; 4 wordBank entries (3 allowed where only 3 forms exist).
- Skip activities that only work in pairs/aloud (USE IT!, pronunciation tables) unless they convert cleanly to a written check.

### Per-unit task steps (identical for Tasks 5–13)

1. Read the unit's PDF pages (given in each task) with the Read tool; note the word boxes, Remember! boxes, RULES boxes, Key phrases and Language point.
2. Add the unit id to `EXPECTED_UNIT_IDS` in `src/data/ep2/ep2.test.js`.
3. Run `npx vitest run src/data/ep2` — expected FAIL on "registers the expected units in order".
4. Write the unit file following the template, recipes and the task's lesson table.
5. Import it in `src/data/ep2/index.js` and append to `ep2Units`.
6. Run `npx vitest run src/data/ep2` — expected PASS. Fix any integrity failures in the data (never weaken the test).
7. Run `npx vitest run && npm run lint` — expected PASS / no errors.
8. Commit: `git add src/data/ep2 && git commit -m "feat: EP2 <Unit> — <title>"`.

---

### Task 5: Starter unit

**Files:** Create `src/data/ep2/starter.js` (export `ep2Starter`); modify `src/data/ep2/index.js`, `src/data/ep2/ep2.test.js`.
**PDF pages:** `5-8` (book p4–7). **Color:** `#7f8c8d`. **Title:** `Starter unit`.

| Lesson id | Type | Title | Source |
|---|---|---|---|
| `ep2-starter-vocab1` | vocabulary | Family | p4: family words (brother/sister, aunt/uncle, nephew/niece, grandson/granddaughter, husband/wife, cousin, twin, partner…), opposites matching, possessive 's (Remember!), key phrases *Asking about families* |
| `ep2-starter-grammar1` | grammar | be, possessive adjectives, question words | p5 |
| `ep2-starter-vocab2` | vocabulary | School | p6 |
| `ep2-starter-grammar2` | grammar | have got, there's / there are | p7 |

`index.js` after this task:
```js
import { ep2Starter } from './starter.js';

export const ep2Units = [ep2Starter];
```
`EXPECTED_UNIT_IDS = ['starter']`. Commit message: `feat: EP2 Starter unit`.

---

### Task 6: Unit 1 — My time

**PDF pages:** `9-18` (book p8–15, plus Review p16–17 for extra item ideas). **Color:** `#2980b9`. Export `ep2Unit1`.

| Lesson id | Title | Source |
|---|---|---|
| `ep2-unit1-vocab1` | Where we spend time | p8–9: *at school, at the shops, in bed, in fast food restaurants, in the car, in the countryside, in the park, in the playground, on the bus, on the phone, in front of the TV, in your room*; Remember! *in/at/on*, *alone, online, indoors, outdoors*; key phrases *How you spend time* (*I spend all/most/a bit of my time…, too much time…, I don't spend any time…*) |
| `ep2-unit1-reading` | Screen time | p10: family rules forum; Vocabulary plus *allow, ban, let* |
| `ep2-unit1-grammar1` | Present simple: affirmative and negative | p11: rules (facts, habits, routines; -s with he/she/it; don't/doesn't + infinitive); Remember! spelling *spends, studies, watches* |
| `ep2-unit1-vocab2` | Free time activities | p12: *bake cakes, blog, go online, collect things, draw/paint a picture, go dancing/shopping/to the cinema, do sport, make videos, meet friends, play an instrument, stay in bed late, write stories…* |
| `ep2-unit1-grammar2` | Present simple: questions | p13: do/does questions, short answers, question words *How often, What, When, Where, Who, Why* |
| `ep2-unit1-speaking` | Thinking of things to do | p14: *Making and responding to suggestions (1)* — *Shall we…?, Let's…, How about …ing?, Why don't we…?, That sounds like a good idea, I don't feel like …ing* |
| `ep2-unit1-writing` | A profile for a web page | p15: *Likes and preferences* key phrases (*I enjoy, I prefer, I'm not really bothered about, I'm (not) a big … fan, I'm not mad about, I'm into*); linkers *and, also, too* (position rules) |

`EXPECTED_UNIT_IDS = ['starter', 'unit1']`. Commit: `feat: EP2 Unit 1 — My time`.

---

### Task 7: Unit 2 — Communication

**PDF pages:** `19-28` (book p18–27). **Color:** `#16a085`. Export `ep2Unit2`.

| Lesson id | Title | Source |
|---|---|---|
| `ep2-unit2-vocab1` | Communication | p18: *email, letter, card…*; key phrases *Comparing answers* |
| `ep2-unit2-reading` | Emojis | p20; Vocabulary plus *colourful, funny, international…* |
| `ep2-unit2-grammar1` | Present continuous: affirmative and negative | p21; study strategy: spelling rules for -ing |
| `ep2-unit2-vocab2` | On the phone | p22: *be engaged, call back, hang up…* |
| `ep2-unit2-grammar2` | Present continuous: questions; present simple vs present continuous | p23 |
| `ep2-unit2-speaking` | Making plans over the phone | p24: key phrases *Making plans* |
| `ep2-unit2-writing` | A report on a survey | p25: *but* and *however*; *Numbers of people* (*everybody, more than half, nobody…*) |

Commit: `feat: EP2 Unit 2 — Communication`.

---

### Task 8: Unit 3 — The past

**PDF pages:** `29-38` (book p28–37). **Color:** `#8e44ad`. Export `ep2Unit3`.

| Lesson id | Title | Source |
|---|---|---|
| `ep2-unit3-vocab1` | Adjectives to describe people and places | p28: *poor, popular, brilliant, brave…*; key phrases *Likes and dislikes* |
| `ep2-unit3-reading` | Museum exhibits | p30; Vocabulary plus *museum, building, exhibition…* |
| `ep2-unit3-grammar1` | was, were; there was, there were | p31 |
| `ep2-unit3-vocab2` | Common verbs | p32: *stay, help, visit, see…*; regular past forms |
| `ep2-unit3-grammar2` | Past simple: affirmative, negative and questions | p33: regular and irregular verbs (keep irregulars consistent with `src/data/irregular.js`) |
| `ep2-unit3-speaking` | Your weekend | p34: *Asking for and giving opinions* |
| `ep2-unit3-writing` | A special event | p35: *Describing an event*; sequencing (*first, then, after that, finally*) |

Commit: `feat: EP2 Unit 3 — The past`.

---

### Task 9: Unit 4 — In the picture

**PDF pages:** `39-48` (book p38–47). **Color:** `#d35400`. Export `ep2Unit4`.

| Lesson id | Title | Source |
|---|---|---|
| `ep2-unit4-vocab1` | Actions and movement | p38: *hold, stand in, jump up, sit on…*; key phrases *Describing a photo* |
| `ep2-unit4-reading` | A moment in time | p40; Vocabulary plus *yell, team, close…* |
| `ep2-unit4-grammar1` | Past continuous: affirmative and negative | p41 |
| `ep2-unit4-vocab2` | Adjectives and adverbs | p42: *slow/slowly, brave/bravely, good/well…* |
| `ep2-unit4-grammar2` | Past continuous: questions; past simple and past continuous | p43 (*when/while*) |
| `ep2-unit4-speaking` | Expressing interest | p44 |
| `ep2-unit4-writing` | The story of a rescue | p45: *Describing events in a photo*; linking words |

Commit: `feat: EP2 Unit 4 — In the picture`.

---

### Task 10: Unit 5 — Achieve

**PDF pages:** `49-58` (book p48–57). **Color:** `#27ae60`. Export `ep2Unit5`.

| Lesson id | Title | Source |
|---|---|---|
| `ep2-unit5-vocab1` | Units of measurement | p48: *billion, century, decade…*; key phrases *Guessing and estimating* |
| `ep2-unit5-reading` | The brain | p50; Vocabulary plus *blood vessels, cells, score…* |
| `ep2-unit5-grammar1` | Comparative and superlative adjectives | p51 |
| `ep2-unit5-vocab2` | Jobs and skills | p52: *programmer, professor, inventor…* |
| `ep2-unit5-grammar2` | Ability: can and could; questions with How …? | p53 |
| `ep2-unit5-speaking` | Making and responding to suggestions (2) | p54; language point *must* and *should* |
| `ep2-unit5-writing` | A biographical webpage | p55: *Staging information* |

Commit: `feat: EP2 Unit 5 — Achieve`.

---

### Task 11: Unit 6 — Survival

**PDF pages:** `59-68` (book p58–67). **Color:** `#2c3e50`. Export `ep2Unit6`.

| Lesson id | Title | Source |
|---|---|---|
| `ep2-unit6-vocab1` | Survival verbs | p58: *build, find, follow, climb…*; key phrases *Ability* |
| `ep2-unit6-reading` | Jungle challenge | p60; Vocabulary plus *competitive, fit, bossy…* |
| `ep2-unit6-grammar1` | will and won't in the first conditional | p61 |
| `ep2-unit6-vocab2` | Survival equipment | p62: *compass, first-aid kit, map…* |
| `ep2-unit6-grammar2` | must and should | p63 (*mustn't* vs *don't have to* only if the book covers it) |
| `ep2-unit6-speaking` | Giving instructions | p64: *Giving instructions and safety information* |
| `ep2-unit6-writing` | A blog | p65: *Giving advice*; imperatives |

Commit: `feat: EP2 Unit 6 — Survival`.

---

### Task 12: Unit 7 — Music

**PDF pages:** `69-78` (book p68–77). **Color:** `#e84393`. Export `ep2Unit7`.

| Lesson id | Title | Source |
|---|---|---|
| `ep2-unit7-vocab1` | Music and instruments | p68: *rap, samba, lyrics…*; key phrases *Talking about music* |
| `ep2-unit7-reading` | A song | p70; Vocabulary plus *reality, hit, star…* (original song-story text, not the book's lyrics) |
| `ep2-unit7-grammar1` | be going to; will and be going to | p71 |
| `ep2-unit7-vocab2` | Star qualities: adjectives and nouns | p72: *ambition/ambitious, charm/charming, energy/energetic…* |
| `ep2-unit7-grammar2` | be going to: questions; present continuous for future arrangements | p73 |
| `ep2-unit7-speaking` | Organizing an event | p74: *Offering to help* |
| `ep2-unit7-writing` | Song reviews | p75: *Reviewing songs*; pronouns |

Commit: `feat: EP2 Unit 7 — Music`.

---

### Task 13: Unit 8 — Scary

**PDF pages:** `79-88` (book p78–87). **Color:** `#6c3483`. Export `ep2Unit8`.

| Lesson id | Title | Source |
|---|---|---|
| `ep2-unit8-vocab1` | Feelings | p78: *enthusiastic about, bad at, fond of…* (adjective + preposition); key phrases *Talking about how things make you feel* |
| `ep2-unit8-reading` | Scream machines | p80; Vocabulary plus *ridiculous, fatal, excited…* |
| `ep2-unit8-grammar1` | Present perfect: affirmative and negative | p81 (past participles consistent with `src/data/irregular.js` where they overlap) |
| `ep2-unit8-vocab2` | Injury collocations | p82: *cut / a cut, burn / burned / a burn…* |
| `ep2-unit8-grammar2` | Present perfect: questions and short answers; ever and never | p83 |
| `ep2-unit8-speaking` | Responding to a problem | p84: *Responding to an accident* |
| `ep2-unit8-writing` | Emails | p85: *Informal expressions*; reason and result (*because, so*) |

`index.js` final form:
```js
import { ep2Starter } from './starter.js';
import { ep2Unit1 } from './unit1.js';
import { ep2Unit2 } from './unit2.js';
import { ep2Unit3 } from './unit3.js';
import { ep2Unit4 } from './unit4.js';
import { ep2Unit5 } from './unit5.js';
import { ep2Unit6 } from './unit6.js';
import { ep2Unit7 } from './unit7.js';
import { ep2Unit8 } from './unit8.js';

export const ep2Units = [ep2Starter, ep2Unit1, ep2Unit2, ep2Unit3, ep2Unit4, ep2Unit5, ep2Unit6, ep2Unit7, ep2Unit8];
```
Final `EXPECTED_UNIT_IDS = ['starter', 'unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6', 'unit7', 'unit8']`.

Commit: `feat: EP2 Unit 8 — Scary`.

---

### Task 14: README + final verification

**Files:** Modify `README.md`.

- [ ] **Step 1: Update README**

- Title/intro: "English Plus — Learning Webapp", covering **English Plus 1** (A1–A2) and **English Plus 2** (A2), 2nd Edition, Wetz (& Pye), OUP.
- Project structure: add `data/books.js` (book registry — order = display order), `data/ep2/` (Book 2 units), `components/BookGrid.jsx`, `components/BookCard.jsx`.
- Replace "Register a new unit by importing it in `src/data/index.js`…" with: Book 1 units → `src/data/index.js` (`allUnits`); Book 2 units → `src/data/ep2/index.js` (`ep2Units`); Book 2 lesson ids must be prefixed `ep2-`.
- Routes: `/#/` book picker, `/#/:bookId`, `/#/:bookId/:unitId/:lessonId/:idx`; old Book 1 links redirect to `/ep1/...`.
- Note that progress for both books lives in the single `ep1_progress` key (kept for backward compatibility).

- [ ] **Step 2: Full verification**

Run: `npx vitest run && npm run lint && npm run build`
Expected: all tests pass, no lint errors, build succeeds.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`, open `http://localhost:5173/#/`: pick Book 2 → Unit 1 → complete one lesson → back to picker shows non-zero Book 2 %. Open `http://localhost:5173/#/unit5` → lands on `/#/ep1/unit5`.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README covers both books"
```
