# Irregular Verbs section — design

**Date:** 2026-04-17
**Status:** Draft — awaiting user review

## Summary

Add a dedicated "Irregular verbs" section to the English Plus 1 learning webapp covering 42 verbs from the coursebook reference (page 104). The section is implemented as a new unit registered at the end of `allUnits`, with 6 lessons grouped by past-simple pattern. Past simple only; past participle deferred.

The section reuses the existing data shape, components, and exercise types — no new components, no new exercise types, no helpers. All content lives in literal arrays in a single new data file.

## Scope

### In scope
- New unit `irregular` with 6 lessons, 42 verbs total, past simple only.
- New file `src/data/irregular.js`.
- Registration in `src/data/index.js` (appended to `allUnits` as the last unit).
- Small `UnitCard.jsx` tweak to render a unit whose `number` is `null`/`undefined` without showing a "Unit null" / "Unit 0" prefix.
- Data-integrity test file `src/data/irregular.test.js` mirroring `unit6.test.js`.

### Out of scope
- Past participle practice (deferred; current app is A1–A2 and does not teach present perfect).
- Any new exercise type.
- Audio / pronunciation playback.
- Spaced repetition or adaptive ordering.
- Review / mixed final lesson.
- Any changes to `unit6-vocab3` or other existing units' content.
- Backend or persistence changes beyond existing `localStorage`.
- Router / URL changes — still the `view` state machine in `App.jsx`.

## The 42 verbs (from reference)

Source: `http://share.vladimirm.com/sc/img-2026-04-17-134249.png` (coursebook p. 104 Irregular verbs).

be, become, begin, break, build, buy, can, catch, come, do, drink, eat, find, fly, get, get up, give, go, have, hide, know, learn, leave, lose, make, meet, read, run, say, see, send, sit, sleep, speak, spend, swim, take, teach, tell, think, wear, write.

## Structure & registration

### Unit metadata

```js
// src/data/irregular.js
export const irregular = {
  id: 'irregular',
  number: null,              // see UnitCard note below
  title: 'Irregular verbs',
  color: '#34495e',          // dark slate — distinct from existing palette
  lessons: [ /* 6 lessons */ ],
};
```

### Registration

`src/data/index.js` imports `irregular` and appends it **at the end** of `allUnits`, so the card appears after Unit 8 on the home grid:

```js
import { irregular } from './irregular.js';
export const allUnits = [starter, unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, irregular];
```

### `number: null` handling in `UnitCard.jsx`

`Starter` uses `number: 0` and is rendered as "0 — Starter" (or similar) by `UnitCard`. For Irregular Verbs there is no natural number. The chosen approach:

- Set `number: null` on the new unit.
- Update `UnitCard.jsx` with a single conditional so the number chip / "Unit N" prefix is omitted when `number == null` (both `null` and `undefined`). The card then shows only the title + color header.

This is a small, local change to one component. Existing tests/screens for units with a number field remain unaffected.

### Lesson `id` convention

Lessons use `irregular-1` … `irregular-6`. No `vocab` / `grammar` prefix, since the entire section is its own category and the suffix distinction would be arbitrary. IDs are globally unique across all units and will serve as the `localStorage` keys.

### Lesson `type`

Reuse `'vocabulary'` for all 6 lessons. The existing `type` field is a label-only hint (used for the chip on the lesson list); no logic depends on it. No new type is introduced.

## The 6 lessons

Each lesson groups verbs by past-simple pattern. Lesson titles surface the pattern so the learner sees *why* these verbs are grouped.

### Lesson 1 — `irregular-1` — "Verbs that add -t or -d" (11 verbs)

**canDo:** "I can use the past simple of common irregular verbs that end in -t or -d."

| Infinitive | Past simple |
|---|---|
| send | sent |
| spend | spent |
| sleep | slept |
| meet | met |
| leave | left |
| lose | lost |
| build | built |
| learn | learnt |
| have | had |
| say | said |
| make | made |

### Lesson 2 — `irregular-2` — "Verbs ending in -ought, -aught, -old" (5 verbs)

**canDo:** "I can use the past simple of verbs that end in -ought, -aught, or -old."

| Infinitive | Past simple |
|---|---|
| buy | bought |
| catch | caught |
| teach | taught |
| think | thought |
| tell | told |

### Lesson 3 — `irregular-3` — "Vowel change: i → a" (5 verbs)

**canDo:** "I can use the past simple of verbs that change i to a."

| Infinitive | Past simple |
|---|---|
| begin | began |
| drink | drank |
| swim | swam |
| sit | sat |
| run | ran |

### Lesson 4 — `irregular-4` — "Vowel change: e/ea → o" (4 verbs)

**canDo:** "I can use the past simple of verbs that change e or ea to o."

| Infinitive | Past simple |
|---|---|
| write | wrote |
| speak | spoke |
| break | broke |
| wear | wore |

### Lesson 5 — `irregular-5` — "Mixed patterns: -ew, -ound, -id, no change" (5 verbs)

**canDo:** "I can use the past simple of verbs with less common patterns."

| Infinitive | Past simple |
|---|---|
| know | knew |
| fly | flew |
| find | found |
| hide | hid |
| read | read |

### Lesson 6 — `irregular-6` — "Most common irregular verbs" (12 verbs)

**canDo:** "I can use the past simple of the most common irregular verbs."

| Infinitive | Past simple |
|---|---|
| be | was / were |
| go | went |
| do | did |
| get | got |
| get up | got up |
| give | gave |
| take | took |
| see | saw |
| eat | ate |
| come | came |
| become | became |
| can | could |

**Total: 42 verbs across 6 lessons.**

## Exercise template per lesson

Each lesson contains the same 6-exercise sequence, in this order. The order corresponds to a learning progression: introduce → recognise → recall → recognise-in-context → produce-in-context → apply.

Per-lesson exercise count: **11 exercise objects** (1 flashcard + 1 matching + 1 grammar-table + 3 MC + 3 fill-blank + 2 word-order). Across 6 lessons: **66 exercise objects**.

### 1. Flashcard (introduce)

One card per verb in the lesson. Front = infinitive, back = past simple.

```js
{ type: 'flashcard',
  cards: [
    { front: 'begin', back: 'began' },
    { front: 'drink', back: 'drank' },
    { front: 'swim',  back: 'swam'  },
    { front: 'sit',   back: 'sat'   },
    { front: 'run',   back: 'ran'   },
  ] }
```

### 2. Matching (recognise)

All verbs in the lesson. Left = infinitive, right = past simple.

```js
{ type: 'matching',
  pairs: [
    { left: 'begin', right: 'began' }, { left: 'drink', right: 'drank' },
    { left: 'swim',  right: 'swam'  }, { left: 'sit',   right: 'sat'   },
    { left: 'run',   right: 'ran'   },
  ] }
```

### 3. Grammar-table (recall, batch)

All verbs in the lesson. The learner types the past form for each row.

```js
{ type: 'grammar-table',
  title: 'Past simple — vowel change i → a',
  promptLabel: 'Base form',
  rows: [
    { prompt: 'begin', answer: 'began' },
    { prompt: 'drink', answer: 'drank' },
    { prompt: 'swim',  answer: 'swam'  },
    { prompt: 'sit',   answer: 'sat'   },
    { prompt: 'run',   answer: 'ran'   },
  ] }
```

Existing `unit6-vocab3` has a 12-row grammar-table in production; no UX changes needed for Lesson 1 (11 rows) or Lesson 6 (12 rows).

### 4. Multiple-choice (recognise in context)

3 sentences per lesson, one verb per sentence. The sentence uses the verb in past simple and the 4 options are:
- the correct past form,
- a regularised wrong form (e.g. `beginned`, `drinked`, `thinked`) — the common learner mistake,
- the base form,
- another past form from the same lesson.

```js
{ type: 'multiple-choice',
  question: 'The film ___ at 8 o\'clock last night. (begin)',
  options: ['begun', 'began', 'begined', 'begin'],
  answer: 'began' }
```

### 5. Fill-blank (produce in context)

3 sentences per lesson. Learner types the past form into the blank. `wordBank` contains 4 entries: correct + regularised wrong form + base form + one other past form from the lesson.

```js
{ type: 'fill-blank',
  template: 'I ___ a glass of water with my lunch. (drink)',
  wordBank: ['drank', 'drinked', 'drink', 'drunk'],
  answer: 'drank' }
```

### 6. Word-order (apply)

2 scrambled sentences per lesson, each using one verb from the lesson in past simple.

```js
{ type: 'word-order',
  words:  ['the', 'pool', 'in', 'we', 'swam', '.'],
  answer: ['We', 'swam', 'in', 'the', 'pool', '.'] }
```

Input `words` entries are lowercase; `answer` entries capitalise the first word (purely cosmetic — comparison is case-insensitive per the repo convention).

## Content edge cases & conventions

### `be` → `was / were`

Both forms are correct for different subjects.
- Grammar-table: **two rows** — `{ prompt: 'be (I / he / she / it)', answer: 'was' }` and `{ prompt: 'be (you / we / they)', answer: 'were' }`.
- Flashcard back: `was / were`.
- Matching: one pair `{ left: 'be', right: 'was / were' }`.
- MC and fill-blank: contextual — the surrounding sentence dictates which form is correct.

### `read` → `read`

Same spelling, different pronunciation.
- Grammar-table accepts the typed string `read`.
- Flashcard back shows pronunciation hint text: `read (pronounced "red")`. The hint is purely visual on the card; the assessed surface everywhere remains the string `read`.

### `learn` → `learnt` vs `learned`

Both are correct in real English. The existing `unit6-grammar3` uses `learned`; the reference image lists `learnt` first and OUP publishes UK English.

**Decision: use `learnt` in the Irregular Verbs section.** Rationale: consistent with reference, emphasises the irregular pattern (which is the whole point of this section), matches OUP's UK English. The existing `unit6-grammar3` answer remains `learned` (no cross-section coherence requirement; the two sections can disagree without breaking anything).

- Flashcard back: `learnt / learned` (learner sees both).
- Matching, grammar-table, MC, fill-blank: canonical answer is `learnt`.

### `get up` → `got up`

Multi-word verb. Confirmed via existing `unit6-grammar1` that `wordBank` supports multi-word entries (`'There was'`, `'There were'` render as buttons).
- Flashcard, matching, MC, and fill-blank: authored the same way as single-word verbs, with `got up` treated as a single token. Confirmed-working shapes via existing units.
- Grammar-table row: `{ prompt: 'get up', answer: 'got up' }`. **Implementation must verify** that the current `GrammarTable` input cell accepts the typed string `got up` (with the space) as correct. If it doesn't, fall back to one of: (a) use prompt `'get up (past)'` with answer expected to be a single word if the component strips spaces; (b) omit `get up` from the grammar-table exercise in Lesson 6 only, keeping it in flashcard / matching / MC / fill-blank (where multi-word support is already proven). Decision is deferred to the implementation plan.

### `can` → `could`

Modal verb; restricted sentence patterns. Use ability/permission sentences, e.g. *"She ___ ride a bike when she was six."* → `could`.

### MC distractor strategy (all lessons)

Every MC has 4 options, constructed uniformly:
1. Correct past form.
2. Regularised wrong form (the common learner mistake).
3. Base form.
4. Another past form from the same lesson (keeps options thematic and tests genuine discrimination).

### Fill-blank `wordBank` shape (all lessons)

4 entries with the same composition rule as MC distractors. `answer` must match one entry exactly.

### Word-order capitalisation (all lessons)

- Input `words`: all lowercase. Authoring guideline: **avoid proper nouns** in word-order exercises for this section, so the all-lowercase constraint (enforced by the data test, matching `unit6.test.js`) holds.
- `answer`: first word capitalised (cosmetic — comparison is case-insensitive per repo convention).

## Testing

New file `src/data/irregular.test.js`, mirroring `src/data/unit6.test.js` style (Vitest `describe` / `it` blocks).

### Data-integrity tests

1. **Lesson order** — `unit.lessons.map(l => l.id)` equals `['irregular-1', 'irregular-2', 'irregular-3', 'irregular-4', 'irregular-5', 'irregular-6']`.
2. **Required fields** — every lesson has non-empty `id`, `type`, `title`, `canDo` and a non-empty `exercises` array.
3. **Fill-blank integrity** — every `fill-blank` has exactly one `___`; `answer` is present in `wordBank`; `wordBank` length is 4.
4. **Multiple-choice integrity** — every MC has exactly 4 `options`; `answer` ∈ `options`.
5. **Word-order integrity** — `answer.length === words.length`; case-insensitive multiset equality of `words` and `answer`; `words` entries all lowercase.
6. **Grammar-table integrity** — every row has non-empty string `prompt` and `answer`.
7. **Matching integrity** — every matching `pairs` array is non-empty; all right-side values match the canonical past form of the corresponding left-side verb.
8. **Coverage test (key assertion)** — collect `{ front, back }` from the 6 flashcard exercises and assert the set equals the full 42-verb list. Catches authoring drift.

### Registration test

Add an assertion in an existing `index.test.js` (or new one) that `allUnits` contains `irregular` as the last element with `id === 'irregular'`.

### UnitCard component behaviour

If existing `UnitCard` tests don't cover it, add a test: a unit with `number: null` renders without an "Unit null" / "Unit 0" label. Manual browser smoke test also suffices.

### Manual smoke test (per repo convention)

- `npm run dev` → home grid shows Irregular Verbs as the last card with the slate colour and no number prefix.
- Click through: lesson list → each of the 6 lessons → run at least one exercise of each type (flashcard, matching, grammar-table, MC, fill-blank, word-order) → score screen → confirm progress saves to `localStorage` under `irregular-N`.
- Streak badge still updates correctly.

## Risks & mitigations

- **Authoring drift between flashcard and other exercises** — the coverage test (#8 above) asserts that flashcards list every verb. Additional in-lesson consistency (matching pairs equal flashcard cards) is checked by test #7.
- **`learnt` vs `learned` inconsistency across the app** — explicitly called out; kept deliberate. Documented in §"Content edge cases".
- **Bulky grammar-tables (11, 12, and 13 rows)** — Lesson 1 has 11 rows, Lesson 6 has 13 rows (12 verbs, with `be` split across two rows per §"`be` → `was / were`"). `unit6-vocab3` already has 12 rows in production, so the size is proven.
- **`got up` in grammar-table** — unverified that the component matches a typed multi-word answer. Verification and fallback plan captured in §"`get up` → `got up`".

## Implementation file list

- Create: `src/data/irregular.js`
- Create: `src/data/irregular.test.js`
- Modify: `src/data/index.js` (add import + append to `allUnits`)
- Modify: `src/components/UnitCard.jsx` (single conditional for `number == null`)
- Modify (if relevant): `src/components/UnitCard.test.jsx` (add null-number case)
