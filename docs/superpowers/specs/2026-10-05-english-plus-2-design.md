# English Plus 2 — Design

**Date:** 2026-10-05
**Status:** Approved

## Goal

Add exercises for the **English Plus 2 (2nd Edition)** Student's Book (Wetz & Pye, OUP, A2) alongside the existing English Plus 1 content. Source: `english_plus_2_SB_2nd_ed.pdf` (book page N = PDF page N+1).

## Decisions

- **Book picker:** the home screen lets the user choose Book 1 or Book 2; each book has its own unit grid.
- **Scope:** Starter + Units 1–8, built in batches (structure first, then one unit per commit).
- **Content:** vocabulary, language focus (grammar), reading, and key phrases (speaking + writing) for every unit. Extra listening, Curriculum extra, Culture, Project and Song pages are out of scope.
- **Reading texts:** original adapted texts on the book's topic, reusing the unit's vocabulary and grammar. Book texts are never copied verbatim. Exercise sentences are newly written and modelled on the book's exercises; grammar rules and word lists follow the book.

## 1. App structure

### Data

- New `src/data/books.js`:
  ```js
  export const books = [
    { id: 'ep1', title: 'English Plus 1', level: 'A1–A2', color: '...', units: [starter, unit1, …, unit8, irregular] },
    { id: 'ep2', title: 'English Plus 2', level: 'A2',    color: '...', units: [ep2Starter, ep2Unit1, …, ep2Unit8, irregular] },
  ];
  ```
- Book 1 data files remain in `src/data/` unchanged. `src/data/index.js` (`allUnits`) is replaced by `books.js`; update its importers.
- Book 2 data lives in `src/data/ep2/`: `starter.js`, `unit1.js` … `unit8.js`, plus `index.js` exporting the ordered array.
- The Irregular verbs unit is the same object in both books, so its progress is shared.

### IDs and progress

- Unit ids stay `starter`, `unit1` … `unit8` (unique within a book); URLs are scoped by book id.
- All Book 2 **lesson** ids are prefixed `ep2-` (e.g. `ep2-unit1-vocab1`), so they never collide with Book 1 lesson ids.
- Progress stays in the single existing `localStorage` key `ep1_progress`, keyed by lesson id. No migration needed.
- Book-level percent = completed lessons / total lessons across the book's units (Irregular verbs included).

### Routing (wouter)

| Path | Screen |
|---|---|
| `/` | `BookGrid` — one card per book (title, level, progress bar) |
| `/:bookId` | `UnitGrid` for that book; header title = book title; back → `/` |
| `/:bookId/:unitId` | `UnitPage`; back → `/:bookId` |
| `/:bookId/:unitId/:lessonId[/:exerciseIdx]` | `LessonPage`; back → `/:bookId/:unitId` |

- **Legacy redirect:** if the first segment is not a known book id but matches a Book 1 unit id (`/unit5`, `/unit5/unit5-vocab1/3`, `/irregular/...`), redirect to the same path prefixed with `/ep1`.
- Unknown book / unit / lesson → redirect to the nearest valid parent (as today: redirect to `/`).

### Components

- New `BookGrid.jsx` (+ `BookCard` or reuse of `UnitCard` styling): card with book color header, title, level, unit count, progress bar.
- `UnitGrid` takes a `title` prop and an `onBack` prop instead of hard-coding "English Plus 1".
- Home header title: "English Plus". README updated to describe both books.

## 2. Book 2 content

Each unit file follows the existing shape (`{ id, number, title, color, lessons: [...] }`) and uses only existing exercise types: `flashcard`, `matching`, `multiple-choice`, `fill-blank`, `true-false`, `word-order`, `grammar-table`, `reading-comprehension`.

### Units

| # | Title | Book pages |
|---|---|---|
| 0 | Starter unit | 4–7 |
| 1 | My time | 8–15 |
| 2 | Communication | 18–25 |
| 3 | The past | 28–35 |
| 4 | In the picture | 38–45 |
| 5 | Achieve | 48–55 |
| 6 | Survival | 58–65 |
| 7 | Music | 68–75 |
| 8 | Scary | 78–85 |

Review / Puzzles pages (16–17, 26–27, …) may be consulted for extra item ideas but get no lessons of their own.

### Lessons per unit (~7)

| Lesson id suffix | Source page | Content | Exercise types |
|---|---|---|---|
| `vocab1` | Vocabulary | main word set + Remember! box + key phrases from that page | flashcard, matching, multiple-choice |
| `reading` | Reading | new adapted text on the same topic; *Vocabulary plus* words | reading-comprehension, multiple-choice, fill-blank |
| `grammar1` | Language focus 1 | book's rules as a grammar-table, then practice | grammar-table, fill-blank, multiple-choice, word-order |
| `vocab2` | Vocabulary and listening | second word set | flashcard, matching, fill-blank |
| `grammar2` | Language focus 2 | rules + practice | grammar-table, fill-blank, word-order, true-false |
| `speaking` | Speaking | key phrases and dialogue functions | multiple-choice (pick the right phrase), matching (e.g. suggestion ↔ response), word-order |
| `writing` | Writing | key phrases + language point (e.g. *and / also / too*) | fill-blank, multiple-choice |

The Starter unit has ~4 lessons: family vocabulary; *be* / possessive adjectives / question words (+ possessive 's); school vocabulary; *have got* / *there's, there are*.

Each lesson has a `canDo` line based on the book's "I can …" statement and roughly 8–15 exercises, comparable to Book 1 Units 4–7.

### Content quality rules

- Every `fill-blank` answer is present in its `wordBank`; every `multiple-choice` answer is present in `options`.
- Correct-answer position varies across MC items (not always first).
- Distractors are plausible but unambiguously wrong for A2 learners.
- Spelling in British English, matching the book.

## 3. Process

1. Structure: `books.js`, routing, `BookGrid`, legacy redirects, tests. Until the Starter unit lands, Book 2's unit list contains only Irregular verbs; that's acceptable for the interim commits.
2. Starter unit, then Units 1–8 in order: read the unit's PDF pages, write the data file, add to `ep2/index.js`, run tests, commit (one commit per unit).

## 4. Testing

- `src/data/ep2/ep2.test.js` — data integrity across all Book 2 units:
  - all lesson ids unique and prefixed `ep2-`
  - no Book 2 lesson id equals any Book 1 lesson id
  - `fill-blank` answer ∈ `wordBank`; `multiple-choice` answer ∈ `options`, options unique
  - matching pairs have non-empty `left`/`right`; flashcards non-empty `front`/`back`
  - reading-comprehension questions well-formed (per the component's existing shape)
  - MC correct-answer index is not the same for every item in a lesson
- Routing / component tests: `/` renders both book cards; `/ep2` renders Book 2 units; `/unit5` redirects to `/ep1/unit5`; back navigation goes lesson → unit → book → picker.
- Existing Book 1 tests keep passing unchanged.
