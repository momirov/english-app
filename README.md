# English Plus 1 — Learning Webapp

Interactive exercises for the **English Plus 1 (2nd Edition)** coursebook by Ben Wetz (Oxford University Press). A1–A2 level.

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
```

No backend, no auth. All progress is stored in `localStorage` under the key `ep1_progress`.

---

## Project structure

```
src/
  main.jsx              entry point
  App.jsx               navigation state machine (home | unit | lesson)
  App.css               all global styles
  index.css             minimal reset (body margin only)

  data/
    index.js            exports allUnits array — import order = display order
    starter.js          Starter unit
    unit1.js … unit8.js Units 1–8

  hooks/
    useProgress.js      read/write localStorage; streak logic

  components/
    Header.jsx          sticky header with back button + streak badge
    UnitGrid.jsx        home screen — grid of unit cards
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

Register a new unit by importing it in `src/data/index.js` and adding it to `allUnits`.

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

There is no router. `App.jsx` holds `{ view, unitId, lessonId }` state:

```
home  →  unit  →  lesson
          ↑           |
          └───────────┘ (back button)
```

`view` is one of `'home'`, `'unit'`, `'lesson'`. Changing these values is the only navigation mechanism.

---

## Current content status

### Starter (color: `#8e44ad`)

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `starter-hobbies` | Hobbies and free time | vocabulary | 2 (flashcard, matching) |
| `starter-be` | The verb "be" | grammar | 6 (grammar-table, fill-blank ×3, MC ×2) |
| `starter-possessives` | Possessive adjectives | grammar | 5 (grammar-table, MC ×2, fill-blank ×2) |
| `starter-adjectives` | Adjectives | vocabulary | 4 (MC ×3, matching) |
| `starter-countries` | Countries and nationalities | vocabulary | 3 (matching, MC ×2) |

**Total: 5 lessons, 20 exercises**

---

### Unit 1 — Towns and cities (color: `#2980b9`)

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `unit1-vocab1` | Places in a town or city | vocabulary | 4 (flashcard, matching, MC ×2) |
| `unit1-grammar1` | there is / there are | grammar | 7 (fill-blank ×4, true-false ×2, MC) |
| `unit1-grammar2` | Comparatives | grammar | 6 (MC ×3, word-order ×2, fill-blank) |

**Total: 3 lessons, 17 exercises**

---

### Unit 2 — Days (color: `#27ae60`)

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `unit2-vocab1` | Daily routines | vocabulary | 3 (flashcard, matching, MC) |
| `unit2-grammar1` | Present simple | grammar | 6 (fill-blank ×3, MC ×2, true-false) |
| `unit2-grammar2` | Adverbs of frequency | grammar | 6 (MC ×3, true-false ×2, word-order) |

**Total: 3 lessons, 15 exercises**

---

### Unit 3 — Wild life (color: `#d35400`)

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `unit3-vocab1` | Animals | vocabulary | 3 (matching, MC ×2) |
| `unit3-grammar1` | Superlatives | grammar | 5 (fill-blank ×2, MC ×2, word-order) |
| `unit3-grammar2` | can for ability | grammar | 6 (true-false ×3, MC ×2, fill-blank) |

**Total: 3 lessons, 14 exercises**

---

### Unit 4 — Learning world (color: `#c0392b`) ★ most expanded

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `unit4-vocab1` | School subjects | vocabulary | 4 (flashcard, MC ×2, matching) |
| `unit4-grammar1` | Present continuous — affirmative | grammar | 10 (grammar-table, fill-blank ×3, MC ×2, true-false ×2, word-order ×2) |
| `unit4-grammar2` | Questions in the present continuous | grammar | 10 (MC ×3, word-order ×3, fill-blank ×2, true-false ×2) |
| `unit4-grammar3` | Present continuous — negatives & spelling | grammar | 11 (grammar-table, fill-blank ×3, MC ×3, matching, true-false ×2, word-order) |
| `unit4-grammar4` | Present continuous vs present simple | grammar | 11 (flashcard, MC ×4, true-false ×2, matching, fill-blank ×2, word-order) |

**Total: 5 lessons, 46 exercises**

---

### Unit 5 — Food and health (color: `#16a085`)

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `unit5-vocab1` | Food | vocabulary | 3 (flashcard, matching, MC) |
| `unit5-grammar1` | Countable and uncountable nouns | grammar | 5 (MC ×2, true-false ×2, matching) |
| `unit5-grammar2` | much, many, a lot of | grammar | 7 (fill-blank ×3, MC ×2, true-false ×2) |

**Total: 3 lessons, 15 exercises**

---

### Unit 6 — Sport (color: `#8e44ad`)

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `unit6-vocab1` | Sports | vocabulary | 3 (matching, MC ×2) |
| `unit6-grammar1` | Past simple — regular verbs | grammar | 6 (fill-blank ×3, word-order ×2, MC) |
| `unit6-vocab2` | Irregular verbs | vocabulary | 4 (flashcard, matching, fill-blank ×2) |

**Total: 3 lessons, 13 exercises**

---

### Unit 7 — Growing up (color: `#e67e22`)

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `unit7-vocab1` | Describing people | vocabulary | 4 (flashcard, MC ×2, matching) |
| `unit7-grammar1` | Object pronouns | grammar | 5 (fill-blank ×3, grammar-table, MC) |
| `unit7-grammar2` | Past simple questions | grammar | 6 (word-order ×2, MC ×2, fill-blank, true-false) |

**Total: 3 lessons, 15 exercises**

---

### Unit 8 — Going away (color: `#2c3e50`)

| Lesson ID | Title | Type | Exercises |
|---|---|---|---|
| `unit8-vocab1` | Holiday vocabulary | vocabulary | 4 (matching, MC ×2, flashcard) |
| `unit8-grammar1` | be going to | grammar | 6 (fill-blank ×3, MC, word-order, true-false) |
| `unit8-grammar2` | will / won't | grammar | 7 (MC ×2, true-false ×2, fill-blank ×2, word-order) |

**Total: 3 lessons, 17 exercises**

---

## Overall totals

| | Units | Lessons | Exercises |
|---|---|---|---|
| **Current** | 9 (Starter + 1–8) | 33 | 172 |

Exercise type breakdown across the whole app:

| Type | Count |
|---|---|
| multiple-choice | 55 |
| fill-blank | 41 |
| true-false | 29 |
| word-order | 18 |
| matching | 15 |
| flashcard | 9 |
| grammar-table | 5 |

---

## Known gaps / suggested next work

- **Units 1–3, 5–8** each have only 3 lessons and 13–17 exercises — they could be expanded the same way Unit 4 was. A good target is 5 lessons and ~40 exercises per unit.
- **Listening / Speaking / Writing lessons** — none yet. These could use `true-false` or `multiple-choice` exercises based on short text passages or dialogue transcripts.
- **Review lessons** at the end of each unit (type `'review'`) — a mixed-exercise set recycling vocabulary and grammar from all lessons in that unit.
- **Unit 6 color** (`#8e44ad`) conflicts with Starter (same purple). Consider changing Unit 6 to a different colour, e.g. `#d81b60` (pink-red).
- **Starter `starter-be` grammar table** — the expected answers are just `am`/`is`/`are` but the table header already says "affirmative". Consider splitting into separate affirmative + negative tables.
