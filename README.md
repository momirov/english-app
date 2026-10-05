# English Plus — Learning Webapp

Interactive exercises for the **English Plus (2nd Edition)** coursebooks (Oxford University Press):

- **English Plus 1** — Ben Wetz. A1–A2.
- **English Plus 2** — Ben Wetz & Diana Pye. A2.

The home screen is a book picker; each book has its own unit grid. Book 2 example sentences and reading texts are original — word lists, grammar rules and key phrases follow the book.

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
```

No backend, no auth. All progress for both books is stored in `localStorage` under the key `ep1_progress` (name kept for backward compatibility).

---

## Project structure

```
src/
  main.jsx              entry point
  App.jsx               routes (wouter, hash location) — book picker → units → lesson
  App.css               all global styles
  index.css             minimal reset (body margin only)

  data/
    books.js            book registry (order = display order), findBook, legacy URL mapping
    index.js            Book 1 units: exports allUnits — import order = display order
    starter.js          Book 1 Starter unit
    unit1.js … unit8.js Book 1 Units 1–8
    irregular.js        Irregular verbs (shared by both books)
    ep2/
      index.js          Book 2 units: exports ep2Units — import order = display order
      starter.js, unit1.js … unit8.js
      ep2.test.js       Book 2 data-integrity tests

  hooks/
    useProgress.js      read/write localStorage; streak logic

  components/
    Header.jsx          sticky header with back button + streak badge
    BookGrid.jsx        home screen — book picker
    BookCard.jsx        single book card with overall progress
    UnitGrid.jsx        one book's grid of unit cards
    UnitCard.jsx        single card with color header + progress bar
    UnitPage.jsx        lesson list for one unit
    LessonPage.jsx      intro screen → exercise flow → score screen
    ExerciseRunner.jsx  iterates exercises, tracks score
    ScoreScreen.jsx     end-of-lesson result + retry / back
    ProgressBar.jsx     thin coloured bar (reused in cards + runner)

    exercises/
      Exercise.css          shared styles for all exercise components
      MultipleChoice.jsx
      FillBlank.jsx
      Matching.jsx
      TrueFalse.jsx
      GrammarTable.jsx
      Flashcard.jsx
      WordOrder.jsx
```

---

## How to modify content

All content lives in `src/data/`. No code changes are needed for purely content edits.

### Unit shape

```js
// src/data/unitN.js
export const unitN = {
  id: 'unit1',          // must be unique across all units
  number: 1,            // shown in UI; use 0 for Starter
  title: 'Towns and cities',
  color: '#2980b9',     // hex — used for card header, banner, progress bars
  lessons: [ /* Lesson objects */ ],
};
```

Register a new unit by importing it in the book's unit list: Book 1 → `src/data/index.js` (`allUnits`), Book 2 → `src/data/ep2/index.js` (`ep2Units`). Book 2 lesson ids must be prefixed `ep2-` (e.g. `ep2-unit3-grammar1`) so they never collide with Book 1 ids in the shared progress store.

### Lesson shape

```js
{
  id: 'unit1-vocab1',    // must be globally unique — used as localStorage key
  type: 'vocabulary',    // vocabulary | grammar | listening | speaking | writing | review
  title: 'Places in a town or city',
  canDo: 'I can talk about places in a town or city.',  // shown on intro card
  exercises: [ /* Exercise objects */ ],
}
```

**Important:** `id` is the key used to store progress. If you rename an `id`, existing user progress for that lesson is lost.

### Exercise types

Every exercise object needs `type` as its first field.

---

#### `multiple-choice`

```js
{
  type: 'multiple-choice',
  question: 'She ___ from England.',
  options: ['am', 'is', 'are', 'be'],   // exactly 4 options
  answer: 'is',                          // must match one option exactly
}
```

---

#### `fill-blank`

```js
{
  type: 'fill-blank',
  template: 'The ___ is on the shelf.',  // exactly one ___ placeholder
  wordBank: ['book', 'cat', 'dog', 'pen'],  // 3–5 words; answer must be in the list
  answer: 'book',
}
```

---

#### `true-false`

```js
{
  type: 'true-false',
  statement: 'York is in the south of England.',
  answer: false,   // boolean true or false
}
```

---

#### `matching`

```js
{
  type: 'matching',
  pairs: [
    { left: 'restaurant', right: 'a place to eat' },
    { left: 'museum',     right: 'a place with old objects' },
    // 4–6 pairs work well; right-side items are shuffled automatically
  ],
}
```

The user clicks a left item, then a right item. Correct pairs are locked and shown in a matched list below. The exercise completes when all pairs are matched.

---

#### `word-order`

```js
{
  type: 'word-order',
  words:  ['is', 'Oxford', 'older', 'than', 'London', '.'],  // scrambled pool
  answer: ['Oxford', 'is', 'older', 'than', 'London', '.'],  // correct order
}
```

Comparison is case-insensitive. Capitalisation of the first word in `answer` is not required to match — the user just needs the right sequence.

---

#### `grammar-table`

```js
{
  type: 'grammar-table',
  title: 'be: affirmative',           // shown above the table
  rows: [
    { prompt: 'I',            answer: 'am' },
    { prompt: 'You',          answer: 'are' },
    { prompt: 'He / She / It', answer: 'is' },
    { prompt: 'We / They',    answer: 'are' },
  ],
}
```

The user types into each cell. All cells are checked together when they click "Check answers". Matching is case-insensitive.

---

#### `flashcard`

```js
{
  type: 'flashcard',
  cards: [
    { front: 'square', back: 'a large open area in a town' },
    // add as many cards as needed; user flips each and advances
  ],
}
```

Flashcard sets always score as correct (they are review, not tested). The exercise completes after the last card is flipped.

---

## Adding a new lesson to an existing unit

1. Open the relevant `src/data/unitN.js`.
2. Add a new object to the `lessons` array.
3. Give it a **unique `id`** — convention is `unitN-vocabX`, `unitN-grammarX`, etc.
4. Add any number of exercise objects.
5. Save — Vite hot-reloads instantly.

Example — adding a writing lesson to Unit 2:

```js
{
  id: 'unit2-writing1',
  type: 'writing',
  title: 'Writing about your day',
  canDo: 'I can write a short paragraph about my daily routine.',
  exercises: [
    {
      type: 'true-false',
      statement: 'We use "a" before words that start with a vowel sound.',
      answer: false,
    },
    {
      type: 'fill-blank',
      template: 'I ___ up at 7 o\'clock every morning.',
      wordBank: ['get', 'gets', 'got', 'am getting'],
      answer: 'get',
    },
  ],
}
```

---

## Adding a brand-new unit

1. Create `src/data/unit9.js` (or whatever number):

```js
export const unit9 = {
  id: 'unit9',
  number: 9,
  title: 'Your new topic',
  color: '#1abc9c',
  lessons: [ /* ... */ ],
};
```

2. Register it in `src/data/index.js`:

```js
import { unit9 } from './unit9.js';
export const allUnits = [starter, unit1, /* ... */ unit8, unit9];
```

---

## Progress system

`src/hooks/useProgress.js` exposes:

| Function | Description |
|---|---|
| `getProgress()` | Returns the full progress object from localStorage |
| `markLesson(lessonId, score, total)` | Saves a lesson result and updates streak |
| `getLessonProgress(lessonId)` | Returns `{ completed, score, total }` for one lesson |
| `getUnitPercent(unitId, lessons)` | Returns 0–100 completion % for a unit |
| `getBookPercent(units)` | Returns 0–100 completion % across all of a book's lessons |

Progress shape in localStorage (`ep1_progress`):

```js
{
  version: 1,
  lastActive: '2026-02-24',   // ISO date string
  streakDays: 3,
  lessons: {
    'unit1-vocab1': { completed: true, score: 8, total: 10, attempts: 2 },
  }
}
```

To reset all progress in the browser: `localStorage.removeItem('ep1_progress')`.

---

## Navigation

Routing uses [wouter](https://github.com/molefrog/wouter) with hash location (`src/main.jsx`):

| URL | Screen |
|---|---|
| `#/` | book picker |
| `#/:bookId` | unit grid (`ep1` or `ep2`) |
| `#/:bookId/:unitId` | lesson list |
| `#/:bookId/:unitId/:lessonId[/:exerciseIdx]` | lesson |

Old Book 1 links without a book segment (e.g. `#/unit5/unit5-vocab1/2`) redirect to `#/ep1/...`. Unknown units redirect to the book; unknown lessons redirect to their unit.

---

## Current content

### English Plus 1

| Unit | Title | Lessons | Exercises |
|---|---|---|---|
| Starter | Starter Unit | 5 | 20 |
| 1 | Towns and cities | 3 | 17 |
| 2 | Days | 3 | 15 |
| 3 | Wild life | 3 | 14 |
| 4 | Learning world | 8 | 76 |
| 5 | Food and health | 6 | 53 |
| 6 | Sport | 8 | 55 |
| 7 | Growing up | 6 | 54 |
| 8 | Going away | 3 | 17 |

### English Plus 2

Each unit has 7 lessons following the book: vocabulary, reading, language focus, vocabulary 2, language focus 2, speaking (key phrases), writing (key phrases + language point). The Starter unit has 4.

| Unit | Title | Lessons | Exercises |
|---|---|---|---|
| Starter | Starter unit | 4 | 60 |
| 1 | My time | 7 | 96 |
| 2 | Communication | 7 | 95 |
| 3 | The past | 7 | 96 |
| 4 | In the picture | 7 | 96 |
| 5 | Achieve | 7 | 95 |
| 6 | Survival | 7 | 91 |
| 7 | Music | 7 | 97 |
| 8 | Scary | 7 | 97 |

### Shared

| Section | Lessons | Exercises |
|---|---|---|
| Irregular verbs | 6 | 66 |

---

## Known gaps / suggested next work

- **Book 1 Units 1–3 and 8** have only 3 lessons each — they could be expanded the same way Units 4–7 were.
- **Grammar-table answers** are compared exactly (case-insensitive). Curly apostrophes from phone keyboards (`don’t`) don't match `don't`; normalising apostrophes in `GrammarTable.jsx` would fix this.
