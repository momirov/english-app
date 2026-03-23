# Exercise UX & Scoring Improvements — Design Spec

**Date:** 2026-03-23
**Scope:** Wrong-answer UX (A) + Scoring fairness (C)
**Status:** Approved

---

## Problem

Two issues make the exercise experience suboptimal for language learning:

1. **Wrong-answer UX:** All exercises auto-advance after 900ms regardless of correctness. Learners don't have enough time to process corrections, and correct/wrong feel identical.

2. **Scoring fairness:** `ReadingComprehension` and `GrammarTable` use all-or-nothing scoring — one wrong answer out of many scores 0 for the entire exercise.

---

## Decisions

| Question | Decision |
|---|---|
| Wrong-answer behaviour | Hybrid: correct → auto-advance 700ms, wrong → "Got it" button required |
| "Got it" scope | All auto-advancing exercises: MC, FillBlank, TrueFalse, WordOrder, ReadingComprehension (per-question) |
| Scoring model | Proportional: correct / total for ReadingComprehension and GrammarTable |
| Implementation approach | Shared `useFeedback` hook |

---

## Architecture

### 1. New hook: `src/hooks/useFeedback.js`

```js
useFeedback({ isCorrect, onAnswer })
// returns: { revealed, waitingForAck, handleReveal, handleAck }
```

**Behaviour:**
- `handleReveal()` — called on selection. Sets `revealed = true`.
  - If `isCorrect` → `setTimeout(onAnswer, 700)`
  - If wrong → sets `waitingForAck = true`, no timer
- `handleAck()` — called when learner taps "Got it". Calls `onAnswer()` immediately.
- `revealed` — disables buttons, shows feedback colours (existing behaviour)
- `waitingForAck` — controls "Got it" button visibility

### 2. Updated exercise components

Affected: `MultipleChoice`, `FillBlank`, `TrueFalse`, `WordOrder`, `ReadingComprehension`

Change pattern per component:
1. Remove local `revealed` state and `setTimeout` call
2. Call `useFeedback({ isCorrect, onAnswer })` — `isCorrect` computed at selection time (already done in each component)
3. Render "Got it" button when `waitingForAck === true`, styled within the existing wrong-answer feedback bar (red area, white button)

**ReadingComprehension:** hook resets per-question naturally (state already re-initialised between questions). "Got it" appears in the per-question feedback area; on tap, advances to next question as before.

**Unaffected:** `Matching`, `GrammarTable`, `Flashcard` — these use manual controls already.

### 3. Proportional scoring

**`ReadingComprehension`**

```js
// Before
onAnswer(wrongCount === 0)

// After
onAnswer(true, { correct: totalQuestions - wrongCount, total: totalQuestions })
```

**`GrammarTable`**

```js
// Before
onAnswer(allCorrect)

// After
onAnswer(true, { correct: correctCount, total: rows.length })
```

**`ExerciseRunner`** — score accumulation:

```js
// Before
if (correct) score++

// After
if (payload) {
  score += payload.correct / payload.total
} else if (correct) {
  score++
}
```

`ScoreScreen` and `useProgress` already work with decimal scores (they compute percentages) — no changes needed.

---

## Files Changed

| File | Change |
|---|---|
| `src/hooks/useFeedback.js` | **New** — feedback/advance/ack logic |
| `src/components/exercises/MultipleChoice.jsx` | Use `useFeedback`, render "Got it" |
| `src/components/exercises/FillBlank.jsx` | Use `useFeedback`, render "Got it" |
| `src/components/exercises/TrueFalse.jsx` | Use `useFeedback`, render "Got it" |
| `src/components/exercises/WordOrder.jsx` | Use `useFeedback`, render "Got it" |
| `src/components/exercises/ReadingComprehension.jsx` | Use `useFeedback` per-question, proportional `onAnswer` |
| `src/components/exercises/GrammarTable.jsx` | Proportional `onAnswer` |
| `src/components/ExerciseRunner.jsx` | Handle optional `payload` in score accumulation |

---

## Out of Scope

- Re-queuing wrong items for a second pass within the session (separate improvement)
- Scoring changes for `Matching` (already has retry; completion-based scoring is appropriate)
- Any changes to `Flashcard` (review-only, always scores 100%)
