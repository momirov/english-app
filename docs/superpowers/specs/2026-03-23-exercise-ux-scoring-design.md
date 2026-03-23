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
useFeedback({ onAnswer })
// returns: { revealed, waitingForAck, handleReveal, handleAck }
```

**`isCorrect` is passed at call time, not at hook initialisation:**

```js
handleReveal(isCorrect)  // called inside the selection/check handler with computed value
```

**Behaviour:**
- `handleReveal(isCorrect)` — called when a selection is made (or "Check" is clicked in WordOrder).
  - No-op if `revealed` is already `true` (guards against double-call).
  - Sets `revealed = true`.
  - If `isCorrect` → stores timer ref: `timerRef.current = setTimeout(onAnswer, 500)`
  - If wrong → sets `waitingForAck = true`, no timer

**Timer note:** `ExerciseRunner` adds its own 400ms fade transition after `onAnswer` is called. The hook timer (500ms) is therefore the feedback-visible window only; total time from selection to next exercise appearing is ~900ms for correct answers — same as the current behaviour. The "Got it" path has no hook timer; total time is the learner's own pace + 400ms fade.
- `handleAck()` — called when learner taps "Got it".
  - Cancels any pending timer via `clearTimeout(timerRef.current)` (safety guard).
  - Calls `onAnswer()` immediately.
- `revealed` — disables buttons, shows feedback colours (existing behaviour)
- `waitingForAck` — controls "Got it" button visibility

**Cleanup on unmount:** The hook uses `useEffect` to return a cleanup function that calls `clearTimeout(timerRef.current)`. This prevents `onAnswer` firing on an unmounted component if `ExerciseRunner` advances before the 700ms timer fires.

**WordOrder note:** `WordOrder` determines correctness when the user clicks "Check", not on item selection. `handleReveal(isCorrect)` maps to the Check button handler — `isCorrect` is computed there. This is consistent with the hook API; the component's two-step UX (build sentence → check) is unchanged.

### 2. Updated exercise components

Affected: `MultipleChoice`, `FillBlank`, `TrueFalse`, `WordOrder`, `ReadingComprehension`

Change pattern per component:
1. Remove local `revealed` state and `setTimeout` call
2. Call `const { revealed, waitingForAck, handleReveal, handleAck } = useFeedback({ onAnswer })`
3. In the selection/check handler, compute `isCorrect` (as now) and call `handleReveal(isCorrect)`
4. Render "Got it" button when `waitingForAck === true`, styled within the existing wrong-answer feedback bar (red area, white button)

**WordOrder specific:** `WordOrder` has a local `const [correct, setCorrect] = useState(false)` used both to track correctness and to apply `correct-bg` / `wrong-bg` CSS classes to the sentence div. After migration, remove this state. Instead, store correctness in a local `let isCorrect` variable inside the Check handler, call `handleReveal(isCorrect)`, and derive the CSS class from `revealed && isCorrect` / `revealed && !isCorrect` using a local ref or a separate minimal state (`const [lastCorrect, setLastCorrect] = useState(false)`) set at check time.

**ReadingComprehension:** hook is instantiated once per component mount. React hook state does not reset on re-render, so the hook must expose a `reset()` function:

```js
useFeedback({ onAnswer })
// returns: { revealed, waitingForAck, handleReveal, handleAck, reset }
```

After `qIdx` is incremented (advancing to the next question), the component calls `reset()` to clear `revealed` and `waitingForAck` back to `false`. "Got it" appears in the per-question feedback area; on tap, `handleAck` calls `onAnswer()` which triggers `qIdx` increment and then `reset()`. On the final question, `onAnswer()` triggers exercise completion as before.

**Unaffected:** `Matching`, `GrammarTable`, `Flashcard` — these use manual controls already.

### 3. Proportional scoring

The existing `onAnswer(correct, detail)` signature is extended to `onAnswer(correct, detail)` where `detail` for proportional exercises carries both answer metadata and scoring info in a unified object. No third argument is introduced.

**`ReadingComprehension`**

```js
// Before
onAnswer(newWrongCount === 0, { wrongCount: newWrongCount, total: questions.length })

// After
onAnswer(true, {
  wrongCount: newWrongCount,
  total: questions.length,
  proportional: { correct: questions.length - newWrongCount, total: questions.length },
})
```

The first arg changes from `wrongCount === 0` to `true` — the exercise is always considered "completed"; the score is now carried in `detail.proportional`.

**`GrammarTable`**

`onAnswer` is called from the "Next" button handler, which runs after `handleCheck` has already stored the count in `score` state. The change is:

```js
// Before (Next button handler)
onAnswer(allCorrect, { title, rows, studentAnswers })

// After (Next button handler) — read from `score` state already available
onAnswer(true, {
  title,
  rows,
  studentAnswers,
  proportional: { correct: score, total: rows.length },
})
```

No variable rename needed — `score` state is already correctly named and available in the Next button handler scope.

**`ExerciseRunner`** — score accumulation (using the existing `newScore` local variable pattern):

```js
// Before
const newScore = correct ? score + 1 : score;

// After
const increment = detail?.proportional
  ? detail.proportional.correct / detail.proportional.total
  : correct ? 1 : 0;
const newScore = score + increment;
```

`ScoreScreen` and `useProgress` already work with decimal scores (they compute percentages) — no changes needed there.

---

## Files Changed

| File | Change |
|---|---|
| `src/hooks/useFeedback.js` | **New** — feedback/advance/ack logic with unmount cleanup |
| `src/components/exercises/MultipleChoice.jsx` | Use `useFeedback`, render "Got it" |
| `src/components/exercises/FillBlank.jsx` | Use `useFeedback`, render "Got it" |
| `src/components/exercises/TrueFalse.jsx` | Use `useFeedback`, render "Got it" |
| `src/components/exercises/WordOrder.jsx` | Use `useFeedback` (Check handler), render "Got it" |
| `src/components/exercises/ReadingComprehension.jsx` | Use `useFeedback` per-question, proportional `onAnswer` |
| `src/components/exercises/GrammarTable.jsx` | Proportional `onAnswer` |
| `src/components/ExerciseRunner.jsx` | Handle `detail.proportional` in score accumulation |

---

## Out of Scope

- Re-queuing wrong items for a second pass within the session (separate improvement)
- Scoring changes for `Matching` (already has retry; completion-based scoring is appropriate)
- Any changes to `Flashcard` (review-only, always scores 100%)
