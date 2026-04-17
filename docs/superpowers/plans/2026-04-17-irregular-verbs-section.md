# Irregular Verbs Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated "Irregular verbs" section to the English Plus 1 webapp — one new unit with 6 lessons covering 42 irregular verbs (past simple only), appended to the existing unit grid.

**Architecture:** New data file `src/data/irregular.js` exporting a unit object in the same shape as `unit1.js`…`unit8.js`. Registered in `src/data/index.js` as the last entry of `allUnits`. No new components. No new exercise types. One small `UnitCard.jsx` tweak to render cards whose `number` is `null`. Data-integrity tests mirror `src/data/unit6.test.js`.

**Tech Stack:** React 19, Vite 7, Vitest 4, Testing Library (jest-dom, react, user-event), jsdom.

**Spec:** `docs/superpowers/specs/2026-04-17-irregular-verbs-section-design.md`

---

## File structure

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/data/irregular.js` | The full unit object: 6 lessons × 11 exercises = 66 exercise objects. |
| Create | `src/data/irregular.test.js` | Vitest data-integrity suite mirroring `unit6.test.js`. |
| Create | `src/components/UnitCard.test.jsx` | Component test for the null-number rendering tweak. |
| Modify | `src/data/index.js` | Import `irregular` and append to `allUnits`. |
| Modify | `src/components/UnitCard.jsx` | Render an empty (non-breaking space) chip when `unit.number == null`. |

Run tests with: `npm test` (single run) or `npm run test:watch` (watch mode).
Run dev server with: `npm run dev` (serves on `http://localhost:5173/english-app/`).

---

## The 42 verbs (full reference)

From spec §"The 42 verbs", grouped by lesson. The canonical past form is the one used by `matching`, `grammar-table`, `multiple-choice`, and `fill-blank` answers. The flashcard back may show extra context (pronunciation, alternate spelling).

**Lesson 1** (11) — send→sent · spend→spent · sleep→slept · meet→met · leave→left · lose→lost · build→built · learn→learnt · have→had · say→said · make→made
**Lesson 2** (5)  — buy→bought · catch→caught · teach→taught · think→thought · tell→told
**Lesson 3** (5)  — begin→began · drink→drank · swim→swam · sit→sat · run→ran
**Lesson 4** (4)  — write→wrote · speak→spoke · break→broke · wear→wore
**Lesson 5** (5)  — know→knew · fly→flew · find→found · hide→hid · read→read
**Lesson 6** (12) — be→was/were · go→went · do→did · get→got · get up→got up · give→gave · take→took · see→saw · eat→ate · come→came · become→became · can→could

---

## Task 1: UnitCard null-number support (TDD)

**Files:**
- Create: `src/components/UnitCard.test.jsx`
- Modify: `src/components/UnitCard.jsx` (the inline ternary in the `.unit-number` span)

Rationale: right now `UnitCard.jsx` renders `unit.number === 0 ? 'Starter' : \`Unit ${unit.number}\``. When `unit.number` is `null`, this would display "Unit null". We handle that case by rendering a non-breaking space (`\u00A0`) so the header chip keeps its height without showing any label.

### Step 1.1: Write the failing test

- [ ] Create `src/components/UnitCard.test.jsx` with three cases — Starter, numbered unit, null-number unit.

```jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UnitCard from './UnitCard';

beforeEach(() => {
  localStorage.clear();
});

const makeUnit = (overrides = {}) => ({
  id: 'test',
  number: 1,
  title: 'Test unit',
  color: '#000000',
  lessons: [{ id: 'test-l1', type: 'vocabulary', title: 'L1', canDo: '', exercises: [] }],
  ...overrides,
});

describe('UnitCard', () => {
  it('renders "Starter" for number === 0', () => {
    render(<UnitCard unit={makeUnit({ number: 0, title: 'Starter Unit' })} onClick={vi.fn()} />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
  });

  it('renders "Unit N" for a numbered unit', () => {
    render(<UnitCard unit={makeUnit({ number: 5 })} onClick={vi.fn()} />);
    expect(screen.getByText('Unit 5')).toBeInTheDocument();
  });

  it('renders no "Unit null" label when number is null', () => {
    render(<UnitCard unit={makeUnit({ number: null, title: 'Irregular verbs' })} onClick={vi.fn()} />);
    expect(screen.queryByText(/Unit null/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Unit 0/)).not.toBeInTheDocument();
    // The title still renders in the card body
    expect(screen.getByText('Irregular verbs')).toBeInTheDocument();
  });
});
```

### Step 1.2: Run the test — confirm it fails

- [ ] Run the test and confirm the null-number assertion fails.

```bash
npm test -- src/components/UnitCard.test.jsx
```

Expected: the first two tests pass, the third fails because the current code renders literal `Unit null`.

### Step 1.3: Modify UnitCard.jsx

- [ ] Change the `.unit-number` span to handle `null`/`undefined`.

Replace lines 10–12 of `src/components/UnitCard.jsx`:

```jsx
        <span className="unit-number">
          {unit.number === 0 ? 'Starter' : `Unit ${unit.number}`}
        </span>
```

with:

```jsx
        <span className="unit-number">
          {unit.number === 0
            ? 'Starter'
            : unit.number == null
              ? '\u00A0'
              : `Unit ${unit.number}`}
        </span>
```

Note: `== null` (loose) catches both `null` and `undefined`. `\u00A0` is a non-breaking space — it preserves the chip's height without rendering a visible label. Do not combine this change with anything else in this file.

### Step 1.4: Run the test — confirm it passes

- [ ] Re-run the test.

```bash
npm test -- src/components/UnitCard.test.jsx
```

Expected: all three tests pass.

### Step 1.5: Commit

- [ ] Stage and commit.

```bash
git add src/components/UnitCard.jsx src/components/UnitCard.test.jsx
git commit -m "$(cat <<'EOF'
feat: UnitCard — render blank chip for units with null number

Preparation for the Irregular Verbs section, which is a unit with no
natural number.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Scaffold irregular.js + registration + Lesson 1 + integrity tests

**Files:**
- Create: `src/data/irregular.js`
- Create: `src/data/irregular.test.js`
- Modify: `src/data/index.js`

This task creates the unit, registers it, writes the full data-integrity test suite, and authors Lesson 1 (the largest lesson — 11 verbs). All tests pass at the end. Subsequent tasks (3–7) each add one more lesson by replacing the corresponding lesson's content.

### Step 2.1: Create `src/data/irregular.js` skeleton with all 6 lesson stubs + Lesson 1 content

- [ ] Create the file with unit metadata, 6 lesson stubs (ids/titles/canDo), and Lesson 1 fully authored.

```js
// src/data/irregular.js
export const irregular = {
  id: 'irregular',
  number: null,
  title: 'Irregular verbs',
  color: '#34495e',
  lessons: [
    {
      id: 'irregular-1',
      type: 'vocabulary',
      title: 'Verbs that add -t or -d',
      canDo: 'I can use the past simple of common irregular verbs that end in -t or -d.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'send',  back: 'sent'  },
            { front: 'spend', back: 'spent' },
            { front: 'sleep', back: 'slept' },
            { front: 'meet',  back: 'met'   },
            { front: 'leave', back: 'left'  },
            { front: 'lose',  back: 'lost'  },
            { front: 'build', back: 'built' },
            { front: 'learn', back: 'learnt / learned' },
            { front: 'have',  back: 'had'   },
            { front: 'say',   back: 'said'  },
            { front: 'make',  back: 'made'  },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'send',  right: 'sent'  },
            { left: 'spend', right: 'spent' },
            { left: 'sleep', right: 'slept' },
            { left: 'meet',  right: 'met'   },
            { left: 'leave', right: 'left'  },
            { left: 'lose',  right: 'lost'  },
            { left: 'build', right: 'built' },
            { left: 'learn', right: 'learnt' },
            { left: 'have',  right: 'had'   },
            { left: 'say',   right: 'said'  },
            { left: 'make',  right: 'made'  },
          ],
        },
        {
          type: 'grammar-table',
          title: 'Past simple — verbs that add -t or -d',
          promptLabel: 'Base form',
          rows: [
            { prompt: 'send',  answer: 'sent'  },
            { prompt: 'spend', answer: 'spent' },
            { prompt: 'sleep', answer: 'slept' },
            { prompt: 'meet',  answer: 'met'   },
            { prompt: 'leave', answer: 'left'  },
            { prompt: 'lose',  answer: 'lost'  },
            { prompt: 'build', answer: 'built' },
            { prompt: 'learn', answer: 'learnt' },
            { prompt: 'have',  answer: 'had'   },
            { prompt: 'say',   answer: 'said'  },
            { prompt: 'make',  answer: 'made'  },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'I ___ an email to my teacher yesterday. (send)',
          options: ['sent', 'sended', 'send', 'spent'],
          answer: 'sent',
        },
        {
          type: 'multiple-choice',
          question: 'She ___ well last night after a long day. (sleep)',
          options: ['slept', 'sleeped', 'sleep', 'met'],
          answer: 'slept',
        },
        {
          type: 'multiple-choice',
          question: 'We ___ a sandcastle on the beach. (build)',
          options: ['built', 'builded', 'build', 'lost'],
          answer: 'built',
        },
        {
          type: 'fill-blank',
          template: 'Last summer they ___ the old house. (leave)',
          wordBank: ['left', 'leaved', 'leave', 'said'],
          answer: 'left',
        },
        {
          type: 'fill-blank',
          template: 'I ___ my keys this morning. (lose)',
          wordBank: ['lost', 'losed', 'lose', 'had'],
          answer: 'lost',
        },
        {
          type: 'fill-blank',
          template: 'The chef ___ a delicious pizza for dinner. (make)',
          wordBank: ['made', 'maked', 'make', 'learnt'],
          answer: 'made',
        },
        {
          type: 'word-order',
          words:  ['new', 'he', 'a', 'language', 'learnt', '.'],
          answer: ['He', 'learnt', 'a', 'new', 'language', '.'],
        },
        {
          type: 'word-order',
          words:  ['hello', 'she', 'said', '.'],
          answer: ['She', 'said', 'hello', '.'],
        },
      ],
    },
    // --- Lessons 2-6 stubs (filled in Tasks 3-7) ---
    {
      id: 'irregular-2',
      type: 'vocabulary',
      title: 'Verbs ending in -ought, -aught, -old',
      canDo: 'I can use the past simple of verbs that end in -ought, -aught, or -old.',
      exercises: [
        { type: 'flashcard', cards: [{ front: 'buy', back: 'bought' }] },
      ],
    },
    {
      id: 'irregular-3',
      type: 'vocabulary',
      title: 'Vowel change: i → a',
      canDo: 'I can use the past simple of verbs that change i to a.',
      exercises: [
        { type: 'flashcard', cards: [{ front: 'begin', back: 'began' }] },
      ],
    },
    {
      id: 'irregular-4',
      type: 'vocabulary',
      title: 'Vowel change: e/ea → o',
      canDo: 'I can use the past simple of verbs that change e or ea to o.',
      exercises: [
        { type: 'flashcard', cards: [{ front: 'write', back: 'wrote' }] },
      ],
    },
    {
      id: 'irregular-5',
      type: 'vocabulary',
      title: 'Mixed patterns: -ew, -ound, -id, no change',
      canDo: 'I can use the past simple of verbs with less common patterns.',
      exercises: [
        { type: 'flashcard', cards: [{ front: 'know', back: 'knew' }] },
      ],
    },
    {
      id: 'irregular-6',
      type: 'vocabulary',
      title: 'Most common irregular verbs',
      canDo: 'I can use the past simple of the most common irregular verbs.',
      exercises: [
        { type: 'flashcard', cards: [{ front: 'go', back: 'went' }] },
      ],
    },
  ],
};
```

Note: Lessons 2–6 start as single-card flashcard stubs to keep the file well-formed and satisfy the "each lesson has non-empty exercises" integrity test. Tasks 3–7 replace each stub with its full 11-exercise content.

### Step 2.2: Register in `src/data/index.js`

- [ ] Add the import and append to `allUnits`.

Modify `src/data/index.js` to:

```js
import { starter } from './starter.js';
import { unit1 } from './unit1.js';
import { unit2 } from './unit2.js';
import { unit3 } from './unit3.js';
import { unit4 } from './unit4.js';
import { unit5 } from './unit5.js';
import { unit6 } from './unit6.js';
import { unit7 } from './unit7.js';
import { unit8 } from './unit8.js';
import { irregular } from './irregular.js';

export const allUnits = [starter, unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, irregular];
```

### Step 2.3: Create `src/data/irregular.test.js` with the full integrity suite

- [ ] Create the test file. These assertions hold true at the end of every task (scaffold + each lesson addition); they serve as the gate for every commit.

```js
import { describe, it, expect } from 'vitest';
import { irregular } from './irregular.js';
import { allUnits } from './index.js';

const LESSON_IDS = [
  'irregular-1',
  'irregular-2',
  'irregular-3',
  'irregular-4',
  'irregular-5',
  'irregular-6',
];

// Full expected verb list (42 verbs). 'be' is a single flashcard entry;
// Lesson 6's grammar-table splits 'be' across two rows but the flashcard / matching
// list one entry per verb. This list matches the 42 entries in the reference.
const EXPECTED_VERBS = [
  // Lesson 1
  'send', 'spend', 'sleep', 'meet', 'leave', 'lose', 'build', 'learn', 'have', 'say', 'make',
  // Lesson 2
  'buy', 'catch', 'teach', 'think', 'tell',
  // Lesson 3
  'begin', 'drink', 'swim', 'sit', 'run',
  // Lesson 4
  'write', 'speak', 'break', 'wear',
  // Lesson 5
  'know', 'fly', 'find', 'hide', 'read',
  // Lesson 6
  'be', 'go', 'do', 'get', 'get up', 'give', 'take', 'see', 'eat', 'come', 'become', 'can',
];

describe('irregular unit — structure', () => {
  it('has the six lessons in the correct order', () => {
    expect(irregular.lessons.map(l => l.id)).toEqual(LESSON_IDS);
  });

  it('has required metadata', () => {
    expect(irregular.id).toBe('irregular');
    expect(irregular.number).toBeNull();
    expect(irregular.title).toBe('Irregular verbs');
    expect(typeof irregular.color).toBe('string');
  });

  it('each lesson has required fields', () => {
    irregular.lessons.forEach(lesson => {
      expect(lesson.id).toBeTruthy();
      expect(lesson.type).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.canDo).toBeTruthy();
      expect(lesson.exercises).toBeInstanceOf(Array);
      expect(lesson.exercises.length).toBeGreaterThan(0);
    });
  });
});

describe('irregular unit — exercise integrity', () => {
  const forEachExercise = (fn) => {
    irregular.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => fn(ex, lesson));
    });
  };

  it('fill-blank exercises have exactly one blank, 4 wordBank entries, and answer in wordBank', () => {
    forEachExercise(ex => {
      if (ex.type === 'fill-blank') {
        const blanks = (ex.template.match(/___/g) || []).length;
        expect(blanks).toBe(1);
        expect(ex.wordBank).toHaveLength(4);
        expect(ex.wordBank).toContain(ex.answer);
      }
    });
  });

  it('multiple-choice exercises have 4 options with answer in options', () => {
    forEachExercise(ex => {
      if (ex.type === 'multiple-choice') {
        expect(ex.options).toHaveLength(4);
        expect(ex.options).toContain(ex.answer);
      }
    });
  });

  it('word-order answer is a case-insensitive permutation of words; words are all lowercase', () => {
    forEachExercise(ex => {
      if (ex.type === 'word-order') {
        expect(ex.answer).toHaveLength(ex.words.length);
        ex.words.forEach(w => expect(w).toBe(w.toLowerCase()));
        const sortedW = [...ex.words].map(w => w.toLowerCase()).sort();
        const sortedA = [...ex.answer].map(w => w.toLowerCase()).sort();
        expect(sortedA).toEqual(sortedW);
      }
    });
  });

  it('grammar-table rows have non-empty prompt and answer strings', () => {
    forEachExercise(ex => {
      if (ex.type === 'grammar-table') {
        ex.rows.forEach(r => {
          expect(typeof r.prompt).toBe('string');
          expect(r.prompt.length).toBeGreaterThan(0);
          expect(typeof r.answer).toBe('string');
          expect(r.answer.length).toBeGreaterThan(0);
        });
      }
    });
  });

  it('matching exercises have non-empty pairs arrays', () => {
    forEachExercise(ex => {
      if (ex.type === 'matching') {
        expect(ex.pairs.length).toBeGreaterThan(0);
        ex.pairs.forEach(p => {
          expect(p.left).toBeTruthy();
          expect(p.right).toBeTruthy();
        });
      }
    });
  });
});

describe('irregular unit — registration', () => {
  it('is appended to allUnits as the last entry', () => {
    expect(allUnits[allUnits.length - 1]).toBe(irregular);
  });
});

// This test is the final coverage gate. It is added in Task 8, not Task 2,
// because Lessons 2-6 start as stubs and only reach full verb coverage after
// Task 7. See Task 8 for the assertion.
```

### Step 2.4: Run tests — confirm all pass

- [ ] Run the whole suite.

```bash
npm test
```

Expected: all tests pass, including the new `irregular.test.js` file. The scaffold satisfies every integrity test because Lesson 1 is complete and Lessons 2–6 each contain one well-formed flashcard.

### Step 2.5: Manual smoke test

- [ ] Start the dev server and verify the card appears.

```bash
npm run dev
```

Open `http://localhost:5173/english-app/` in a browser. Verify:
- A new card appears **after Unit 8** titled "Irregular verbs".
- The card header is dark slate (`#34495e`) and shows no "Unit N" label (chip is blank).
- The card body shows the title and "6 lessons".
- Clicking the card navigates to the lesson list showing 6 entries.
- Clicking lesson `irregular-1` starts Lesson 1 and the flashcard deck renders the first card (`send` → `sent`).

Stop the dev server (`Ctrl+C`) when done.

### Step 2.6: Commit

- [ ] Stage and commit.

```bash
git add src/data/irregular.js src/data/irregular.test.js src/data/index.js
git commit -m "$(cat <<'EOF'
feat: Irregular verbs section — scaffold + Lesson 1 (verbs that add -t/-d)

Adds the new unit, registers it at the end of allUnits, authors Lesson 1
(11 verbs × 11 exercises), and introduces the data-integrity test suite
that will guard all subsequent lesson additions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Author Lesson 2 — "Verbs ending in -ought, -aught, -old"

**Files:** Modify `src/data/irregular.js` (replace the `irregular-2` lesson stub).

Verbs: buy→bought · catch→caught · teach→taught · think→thought · tell→told

### Step 3.1: Replace the `irregular-2` stub with the full lesson

- [ ] In `src/data/irregular.js`, find the `{ id: 'irregular-2', …, exercises: [ { type: 'flashcard', cards: [{ front: 'buy', back: 'bought' }] } ] }` block and replace the whole object with:

```js
    {
      id: 'irregular-2',
      type: 'vocabulary',
      title: 'Verbs ending in -ought, -aught, -old',
      canDo: 'I can use the past simple of verbs that end in -ought, -aught, or -old.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'buy',   back: 'bought'  },
            { front: 'catch', back: 'caught'  },
            { front: 'teach', back: 'taught'  },
            { front: 'think', back: 'thought' },
            { front: 'tell',  back: 'told'    },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'buy',   right: 'bought'  },
            { left: 'catch', right: 'caught'  },
            { left: 'teach', right: 'taught'  },
            { left: 'think', right: 'thought' },
            { left: 'tell',  right: 'told'    },
          ],
        },
        {
          type: 'grammar-table',
          title: 'Past simple — -ought / -aught / -old',
          promptLabel: 'Base form',
          rows: [
            { prompt: 'buy',   answer: 'bought'  },
            { prompt: 'catch', answer: 'caught'  },
            { prompt: 'teach', answer: 'taught'  },
            { prompt: 'think', answer: 'thought' },
            { prompt: 'tell',  answer: 'told'    },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'They ___ a new car last month. (buy)',
          options: ['bought', 'buyed', 'buy', 'caught'],
          answer: 'bought',
        },
        {
          type: 'multiple-choice',
          question: 'He ___ the ball just before it hit the ground. (catch)',
          options: ['caught', 'catched', 'catch', 'thought'],
          answer: 'caught',
        },
        {
          type: 'multiple-choice',
          question: 'My grandmother ___ me how to cook. (teach)',
          options: ['taught', 'teached', 'teach', 'told'],
          answer: 'taught',
        },
        {
          type: 'fill-blank',
          template: 'I ___ the film was amazing. (think)',
          wordBank: ['thought', 'thinked', 'think', 'taught'],
          answer: 'thought',
        },
        {
          type: 'fill-blank',
          template: 'She ___ us a long story. (tell)',
          wordBank: ['told', 'telled', 'tell', 'bought'],
          answer: 'told',
        },
        {
          type: 'fill-blank',
          template: 'He ___ fish by the lake. (catch)',
          wordBank: ['caught', 'catched', 'catch', 'told'],
          answer: 'caught',
        },
        {
          type: 'word-order',
          words:  ['bought', 'bread', 'i', 'some', '.'],
          answer: ['I', 'bought', 'some', 'bread', '.'],
        },
        {
          type: 'word-order',
          words:  ['thought', 'hard', 'he', 'about', 'it', '.'],
          answer: ['He', 'thought', 'hard', 'about', 'it', '.'],
        },
      ],
    },
```

### Step 3.2: Run tests — confirm all pass

- [ ] ```bash
npm test -- src/data/irregular.test.js
```

Expected: all integrity tests still pass.

### Step 3.3: Commit

- [ ] ```bash
git add src/data/irregular.js
git commit -m "$(cat <<'EOF'
feat: Irregular verbs Lesson 2 — -ought / -aught / -old

buy, catch, teach, think, tell — 11 exercises.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Author Lesson 3 — "Vowel change: i → a"

**Files:** Modify `src/data/irregular.js` (replace the `irregular-3` stub).

Verbs: begin→began · drink→drank · swim→swam · sit→sat · run→ran

### Step 4.1: Replace the `irregular-3` stub with the full lesson

- [ ] In `src/data/irregular.js`, replace the `irregular-3` block with:

```js
    {
      id: 'irregular-3',
      type: 'vocabulary',
      title: 'Vowel change: i → a',
      canDo: 'I can use the past simple of verbs that change i to a.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'begin', back: 'began' },
            { front: 'drink', back: 'drank' },
            { front: 'swim',  back: 'swam'  },
            { front: 'sit',   back: 'sat'   },
            { front: 'run',   back: 'ran'   },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'begin', right: 'began' },
            { left: 'drink', right: 'drank' },
            { left: 'swim',  right: 'swam'  },
            { left: 'sit',   right: 'sat'   },
            { left: 'run',   right: 'ran'   },
          ],
        },
        {
          type: 'grammar-table',
          title: 'Past simple — vowel change i → a',
          promptLabel: 'Base form',
          rows: [
            { prompt: 'begin', answer: 'began' },
            { prompt: 'drink', answer: 'drank' },
            { prompt: 'swim',  answer: 'swam'  },
            { prompt: 'sit',   answer: 'sat'   },
            { prompt: 'run',   answer: 'ran'   },
          ],
        },
        {
          type: 'multiple-choice',
          question: "The film ___ at 8 o'clock last night. (begin)",
          options: ['begun', 'began', 'begined', 'begin'],
          answer: 'began',
        },
        {
          type: 'multiple-choice',
          question: 'We ___ in the lake all afternoon. (swim)',
          options: ['swam', 'swimmed', 'swim', 'sat'],
          answer: 'swam',
        },
        {
          type: 'multiple-choice',
          question: 'He ___ five kilometres this morning. (run)',
          options: ['ran', 'runned', 'run', 'drank'],
          answer: 'ran',
        },
        {
          type: 'fill-blank',
          template: 'I ___ a glass of water with my lunch. (drink)',
          wordBank: ['drank', 'drinked', 'drink', 'drunk'],
          answer: 'drank',
        },
        {
          type: 'fill-blank',
          template: 'They ___ on the bench and waited. (sit)',
          wordBank: ['sat', 'sitted', 'sit', 'ran'],
          answer: 'sat',
        },
        {
          type: 'fill-blank',
          template: 'The story ___ with a dramatic scene. (begin)',
          wordBank: ['began', 'beginned', 'begin', 'sat'],
          answer: 'began',
        },
        {
          type: 'word-order',
          words:  ['the', 'pool', 'in', 'we', 'swam', '.'],
          answer: ['We', 'swam', 'in', 'the', 'pool', '.'],
        },
        {
          type: 'word-order',
          words:  ['coffee', 'some', 'drank', 'he', '.'],
          answer: ['He', 'drank', 'some', 'coffee', '.'],
        },
      ],
    },
```

### Step 4.2: Run tests — confirm all pass

- [ ] ```bash
npm test -- src/data/irregular.test.js
```

### Step 4.3: Commit

- [ ] ```bash
git add src/data/irregular.js
git commit -m "$(cat <<'EOF'
feat: Irregular verbs Lesson 3 — vowel change i → a

begin, drink, swim, sit, run — 11 exercises.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Author Lesson 4 — "Vowel change: e/ea → o"

**Files:** Modify `src/data/irregular.js` (replace the `irregular-4` stub).

Verbs: write→wrote · speak→spoke · break→broke · wear→wore (4 verbs — this is the smallest lesson)

### Step 5.1: Replace the `irregular-4` stub with the full lesson

- [ ] In `src/data/irregular.js`, replace the `irregular-4` block with:

```js
    {
      id: 'irregular-4',
      type: 'vocabulary',
      title: 'Vowel change: e/ea → o',
      canDo: 'I can use the past simple of verbs that change e or ea to o.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'write', back: 'wrote' },
            { front: 'speak', back: 'spoke' },
            { front: 'break', back: 'broke' },
            { front: 'wear',  back: 'wore'  },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'write', right: 'wrote' },
            { left: 'speak', right: 'spoke' },
            { left: 'break', right: 'broke' },
            { left: 'wear',  right: 'wore'  },
          ],
        },
        {
          type: 'grammar-table',
          title: 'Past simple — vowel change e/ea → o',
          promptLabel: 'Base form',
          rows: [
            { prompt: 'write', answer: 'wrote' },
            { prompt: 'speak', answer: 'spoke' },
            { prompt: 'break', answer: 'broke' },
            { prompt: 'wear',  answer: 'wore'  },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'She ___ a long letter to her friend. (write)',
          options: ['wrote', 'writed', 'write', 'spoke'],
          answer: 'wrote',
        },
        {
          type: 'multiple-choice',
          question: 'He ___ to the manager about the problem. (speak)',
          options: ['spoke', 'speaked', 'speak', 'wore'],
          answer: 'spoke',
        },
        {
          type: 'multiple-choice',
          question: 'She ___ a beautiful red dress to the party. (wear)',
          options: ['wore', 'weared', 'wear', 'broke'],
          answer: 'wore',
        },
        {
          type: 'fill-blank',
          template: 'The child ___ the window with a ball. (break)',
          wordBank: ['broke', 'breaked', 'break', 'wrote'],
          answer: 'broke',
        },
        {
          type: 'fill-blank',
          template: 'I ___ an email to the teacher. (write)',
          wordBank: ['wrote', 'writed', 'write', 'wore'],
          answer: 'wrote',
        },
        {
          type: 'fill-blank',
          template: 'They ___ French on holiday. (speak)',
          wordBank: ['spoke', 'speaked', 'speak', 'broke'],
          answer: 'spoke',
        },
        {
          type: 'word-order',
          words:  ['a', 'he', 'wore', 'coat', 'blue', '.'],
          answer: ['He', 'wore', 'a', 'blue', 'coat', '.'],
        },
        {
          type: 'word-order',
          words:  ['wrote', 'book', 'she', 'a', '.'],
          answer: ['She', 'wrote', 'a', 'book', '.'],
        },
      ],
    },
```

### Step 5.2: Run tests — confirm all pass

- [ ] ```bash
npm test -- src/data/irregular.test.js
```

### Step 5.3: Commit

- [ ] ```bash
git add src/data/irregular.js
git commit -m "$(cat <<'EOF'
feat: Irregular verbs Lesson 4 — vowel change e/ea → o

write, speak, break, wear — 11 exercises.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Author Lesson 5 — "Mixed patterns: -ew, -ound, -id, no change"

**Files:** Modify `src/data/irregular.js` (replace the `irregular-5` stub).

Verbs: know→knew · fly→flew · find→found · hide→hid · read→read

Note on `read`: spelling unchanged, pronunciation changes (`/riːd/` → `/red/`). The flashcard back includes the pronunciation hint as plain text.

### Step 6.1: Replace the `irregular-5` stub with the full lesson

- [ ] In `src/data/irregular.js`, replace the `irregular-5` block with:

```js
    {
      id: 'irregular-5',
      type: 'vocabulary',
      title: 'Mixed patterns: -ew, -ound, -id, no change',
      canDo: 'I can use the past simple of verbs with less common patterns.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'know', back: 'knew'  },
            { front: 'fly',  back: 'flew'  },
            { front: 'find', back: 'found' },
            { front: 'hide', back: 'hid'   },
            { front: 'read', back: 'read (pronounced "red")' },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'know', right: 'knew'  },
            { left: 'fly',  right: 'flew'  },
            { left: 'find', right: 'found' },
            { left: 'hide', right: 'hid'   },
            { left: 'read', right: 'read'  },
          ],
        },
        {
          type: 'grammar-table',
          title: 'Past simple — mixed patterns',
          promptLabel: 'Base form',
          rows: [
            { prompt: 'know', answer: 'knew'  },
            { prompt: 'fly',  answer: 'flew'  },
            { prompt: 'find', answer: 'found' },
            { prompt: 'hide', answer: 'hid'   },
            { prompt: 'read', answer: 'read'  },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'He ___ the answer immediately. (know)',
          options: ['knew', 'knowed', 'know', 'flew'],
          answer: 'knew',
        },
        {
          type: 'multiple-choice',
          question: 'We ___ to Paris last summer. (fly)',
          options: ['flew', 'flied', 'fly', 'found'],
          answer: 'flew',
        },
        {
          type: 'multiple-choice',
          question: 'She ___ her keys under the mat. (hide)',
          options: ['hid', 'hided', 'hide', 'knew'],
          answer: 'hid',
        },
        {
          type: 'fill-blank',
          template: 'I ___ my phone in the bag. (find)',
          wordBank: ['found', 'finded', 'find', 'knew'],
          answer: 'found',
        },
        {
          type: 'fill-blank',
          template: 'He ___ the whole book in one day. (read)',
          wordBank: ['read', 'readed', 'reads', 'hid'],
          answer: 'read',
        },
        {
          type: 'fill-blank',
          template: 'They ___ the answer was hard. (know)',
          wordBank: ['knew', 'knowed', 'know', 'found'],
          answer: 'knew',
        },
        {
          type: 'word-order',
          words:  ['read', 'i', 'book', 'a', '.'],
          answer: ['I', 'read', 'a', 'book', '.'],
        },
        {
          type: 'word-order',
          words:  ['found', 'she', 'letter', 'the', '.'],
          answer: ['She', 'found', 'the', 'letter', '.'],
        },
      ],
    },
```

### Step 6.2: Run tests — confirm all pass

- [ ] ```bash
npm test -- src/data/irregular.test.js
```

### Step 6.3: Commit

- [ ] ```bash
git add src/data/irregular.js
git commit -m "$(cat <<'EOF'
feat: Irregular verbs Lesson 5 — mixed patterns

know, fly, find, hide, read — 11 exercises.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Author Lesson 6 — "Most common irregular verbs"

**Files:** Modify `src/data/irregular.js` (replace the `irregular-6` stub).

Verbs: be→was/were · go→went · do→did · get→got · get up→got up · give→gave · take→took · see→saw · eat→ate · come→came · become→became · can→could (12 verbs, the largest lesson)

Special cases (from spec §"Content edge cases"):
- `be` — flashcard back: `was / were`; matching right: `was / were`; grammar-table: **two rows** (`be (I / he / she / it)` → `was`, `be (you / we / they)` → `were`).
- `get up` — multi-word; verified to work with the existing `GrammarTable` matcher (it uses `.trim().toLowerCase()` — internal whitespace is preserved).

### Step 7.1: Replace the `irregular-6` stub with the full lesson

- [ ] In `src/data/irregular.js`, replace the `irregular-6` block with:

```js
    {
      id: 'irregular-6',
      type: 'vocabulary',
      title: 'Most common irregular verbs',
      canDo: 'I can use the past simple of the most common irregular verbs.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'be',     back: 'was / were' },
            { front: 'go',     back: 'went'       },
            { front: 'do',     back: 'did'        },
            { front: 'get',    back: 'got'        },
            { front: 'get up', back: 'got up'     },
            { front: 'give',   back: 'gave'       },
            { front: 'take',   back: 'took'       },
            { front: 'see',    back: 'saw'        },
            { front: 'eat',    back: 'ate'        },
            { front: 'come',   back: 'came'       },
            { front: 'become', back: 'became'     },
            { front: 'can',    back: 'could'      },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'be',     right: 'was / were' },
            { left: 'go',     right: 'went'       },
            { left: 'do',     right: 'did'        },
            { left: 'get',    right: 'got'        },
            { left: 'get up', right: 'got up'     },
            { left: 'give',   right: 'gave'       },
            { left: 'take',   right: 'took'       },
            { left: 'see',    right: 'saw'        },
            { left: 'eat',    right: 'ate'        },
            { left: 'come',   right: 'came'       },
            { left: 'become', right: 'became'     },
            { left: 'can',    right: 'could'      },
          ],
        },
        {
          type: 'grammar-table',
          title: 'Past simple — most common irregular verbs',
          promptLabel: 'Base form',
          rows: [
            { prompt: 'be (I / he / she / it)', answer: 'was'    },
            { prompt: 'be (you / we / they)',   answer: 'were'   },
            { prompt: 'go',                     answer: 'went'   },
            { prompt: 'do',                     answer: 'did'    },
            { prompt: 'get',                    answer: 'got'    },
            { prompt: 'get up',                 answer: 'got up' },
            { prompt: 'give',                   answer: 'gave'   },
            { prompt: 'take',                   answer: 'took'   },
            { prompt: 'see',                    answer: 'saw'    },
            { prompt: 'eat',                    answer: 'ate'    },
            { prompt: 'come',                   answer: 'came'   },
            { prompt: 'become',                 answer: 'became' },
            { prompt: 'can',                    answer: 'could'  },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'She ___ to school every day last year. (go)',
          options: ['went', 'goed', 'go', 'did'],
          answer: 'went',
        },
        {
          type: 'multiple-choice',
          question: 'I ___ pizza for dinner yesterday. (eat)',
          options: ['ate', 'eated', 'eat', 'took'],
          answer: 'ate',
        },
        {
          type: 'multiple-choice',
          question: 'He ___ swim when he was five. (can)',
          options: ['could', 'canned', 'can', 'was'],
          answer: 'could',
        },
        {
          type: 'fill-blank',
          template: 'They ___ very happy at the party. (be)',
          wordBank: ['were', 'was', 'are', 'been'],
          answer: 'were',
        },
        {
          type: 'fill-blank',
          template: 'I ___ a beautiful rainbow this morning. (see)',
          wordBank: ['saw', 'seed', 'see', 'gave'],
          answer: 'saw',
        },
        {
          type: 'fill-blank',
          template: 'She ___ a photo of her dog. (take)',
          wordBank: ['took', 'taked', 'take', 'got'],
          answer: 'took',
        },
        {
          type: 'word-order',
          words:  ['cake', 'a', 'i', 'ate', '.'],
          answer: ['I', 'ate', 'a', 'cake', '.'],
        },
        {
          type: 'word-order',
          words:  ['became', 'a', 'she', 'doctor', '.'],
          answer: ['She', 'became', 'a', 'doctor', '.'],
        },
      ],
    },
```

### Step 7.2: Run tests — confirm all pass

- [ ] ```bash
npm test -- src/data/irregular.test.js
```

### Step 7.3: Commit

- [ ] ```bash
git add src/data/irregular.js
git commit -m "$(cat <<'EOF'
feat: Irregular verbs Lesson 6 — most common irregular verbs

be (was/were), go, do, get, get up, give, take, see, eat, come, become,
can — 12 verbs, 11 exercises. be splits into two grammar-table rows.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Coverage test + final manual smoke test

**Files:** Modify `src/data/irregular.test.js` (append coverage test).

The coverage test asserts that the flashcard exercises across all 6 lessons cover exactly the 42-verb reference list — catches authoring drift. It is added last because it would have failed during Tasks 2–7 (Lessons 2–6 were stubs).

### Step 8.1: Append the coverage test to `src/data/irregular.test.js`

- [ ] At the bottom of `src/data/irregular.test.js` (replacing the placeholder comment from Task 2.3), add:

```js
describe('irregular unit — verb coverage', () => {
  it('flashcards across all 6 lessons cover exactly the 42-verb reference list', () => {
    const flashcardFronts = irregular.lessons.flatMap(lesson =>
      lesson.exercises
        .filter(ex => ex.type === 'flashcard')
        .flatMap(ex => ex.cards.map(c => c.front))
    );
    expect(new Set(flashcardFronts)).toEqual(new Set(EXPECTED_VERBS));
    expect(flashcardFronts).toHaveLength(EXPECTED_VERBS.length); // 42 — no duplicates
  });

  it('matching pairs within each lesson use the same verbs as the flashcard in that lesson', () => {
    irregular.lessons.forEach(lesson => {
      const flashcard = lesson.exercises.find(ex => ex.type === 'flashcard');
      const matching = lesson.exercises.find(ex => ex.type === 'matching');
      if (!flashcard || !matching) return; // only relevant to fully-authored lessons
      const flashFronts = new Set(flashcard.cards.map(c => c.front));
      const matchLefts = new Set(matching.pairs.map(p => p.left));
      expect(matchLefts).toEqual(flashFronts);
    });
  });

  it('grammar-table prompts within each lesson cover all flashcard fronts (except be which may be split)', () => {
    irregular.lessons.forEach(lesson => {
      const flashcard = lesson.exercises.find(ex => ex.type === 'flashcard');
      const table = lesson.exercises.find(ex => ex.type === 'grammar-table');
      if (!flashcard || !table) return;
      const flashFronts = flashcard.cards.map(c => c.front);
      // Each flashcard front must appear in at least one table row's prompt
      flashFronts.forEach(front => {
        const appears = table.rows.some(r => r.prompt === front || r.prompt.startsWith(`${front} `));
        expect(appears, `grammar-table of ${lesson.id} should include prompt for "${front}"`).toBe(true);
      });
    });
  });
});
```

### Step 8.2: Run full test suite — confirm all pass

- [ ] Run the whole suite, not just the irregular file.

```bash
npm test
```

Expected: every test passes across every file. No regressions.

### Step 8.3: Manual smoke test (full flow)

- [ ] Start dev server and walk the full flow.

```bash
npm run dev
```

Open `http://localhost:5173/english-app/` and verify:

1. **Home grid:** "Irregular verbs" card is the last card, dark-slate header, blank chip (no "Unit N" label), "6 lessons" in the body.
2. **Lesson list:** click the card → see 6 lessons with their titles (Verbs that add -t or -d, Verbs ending in -ought…, Vowel change: i → a, Vowel change: e/ea → o, Mixed patterns…, Most common irregular verbs).
3. **Per-lesson end-to-end:** enter each lesson and click through all 11 exercises. Per-type checks:
   - Flashcard: flip once to reveal the past form.
   - Matching: click left+right pairs to match them all.
   - Grammar-table: type one correct and one wrong answer, then "Check answers" — verify the wrong one shows the correct answer in the Correct column.
   - Multiple-choice: click each option once — correct gets ✓, wrong gets ✗.
   - Fill-blank: click an option from the word bank; verify correct/wrong feedback.
   - Word-order: click the words in the right order; verify "✓ Correct!".
4. **Lesson 6 specifically:** confirm that in the grammar-table, typing `got up` (with a space) into the `get up` row is accepted as correct, and typing `was` and `were` in the two split `be` rows works.
5. **Progress saved:** after completing one lesson, return to the home grid and confirm the Irregular verbs progress bar has advanced. Open DevTools → Application → Local Storage → `ep1_progress` and confirm a key like `irregular-1` is present with `completed: true`.
6. **Streak badge:** still updates correctly (completing a lesson bumps the streak count if it's a new day).

Stop the dev server (`Ctrl+C`) when done.

### Step 8.4: Commit

- [ ] ```bash
git add src/data/irregular.test.js
git commit -m "$(cat <<'EOF'
test: Irregular verbs — 42-verb coverage + cross-exercise consistency

Asserts that flashcard fronts across all 6 lessons equal the reference
verb list, and that matching/grammar-table exercises in each lesson
reference the same verb set as the flashcard.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Done criteria

- `npm test` passes with no failures and no skipped tests.
- `npm run dev` serves the app, the Irregular Verbs card appears last on the home grid, all 6 lessons are playable end-to-end, and lesson progress persists to `localStorage` under `irregular-1` … `irregular-6`.
- 9 commits on top of `main`: 1 (UnitCard tweak) + 1 (scaffold + L1) + 5 (L2 … L6) + 1 (coverage test) + 1 optional (final merge/PR if used).
