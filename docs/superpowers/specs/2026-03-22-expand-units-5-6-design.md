# Design: Expand Units 5 and 6

**Date:** 2026-03-22
**Status:** Approved

## Overview

Add 2 new lessons to each of Unit 5 (Food and Health) and Unit 6 (Sport) to bring both units from 3 lessons to 5 lessons, matching the depth of Unit 4 (Learning world).

## Context

- **App:** English Plus 1 Interactive Learning Webapp (React + Vite, no backend)
- **Content source:** `src/data/unit5.js` and `src/data/unit6.js`
- **Reference:** Unit 4 (`src/data/unit4.js`) — 5 lessons, ~46 exercises — is the expanded template
- **Exercise types available:** `flashcard`, `matching`, `multiple-choice`, `true-false`, `fill-blank`, `word-order`, `grammar-table`

## Unit 5: Food and Health

### Current state (3 lessons, 15 exercises)
1. `unit5-vocab1` — Food vocabulary
2. `unit5-grammar1` — Countable and Uncountable Nouns
3. `unit5-grammar2` — much, many, a lot of

### New Lesson 4: `unit5-vocab2` — Health (~10 exercises)

**canDo:** "I can talk about health and parts of the body."

**Exercises:**
1. **Flashcard** (8 cards): head 🤕, stomach 🤢, back, arm 💪, leg 🦵, throat, temperature 🌡️, headache
2. **Matching** (6 pairs): body part words → emoji + short description
3. **Multiple Choice** (2 questions): health vocabulary in context (e.g., sore throat, stomach ache)

### New Lesson 5: `unit5-grammar3` — should / shouldn't (~11 exercises)

**canDo:** "I can use should and shouldn't to give health advice."

**Exercises:**
1. **Grammar table**: should/shouldn't + base verb (affirmative, negative, question rows)
2. **Fill-blank** (4 questions): "You ___ eat vegetables every day." → should
3. **Multiple Choice** (3 questions): choosing should/shouldn't in health advice contexts
4. **True/False** (2 statements): rules about should (e.g., "'Should' is followed by the infinitive with 'to'." → false)
5. **Word Order** (2 sentences): reconstruct health advice sentences

### Target state: 5 lessons, ~35 exercises

---

## Unit 6: Sport

### Current state (3 lessons, 13 exercises)
1. `unit6-vocab1` — Sports vocabulary
2. `unit6-grammar1` — Past Simple (Regular Verbs)
3. `unit6-vocab2` — Irregular Verbs

### New Lesson 4: `unit6-grammar2` — Past Simple Negatives (~11 exercises)

**canDo:** "I can use didn't to talk about things that didn't happen."

**Exercises:**
1. **Grammar table**: subject + didn't + base verb (all persons)
2. **Fill-blank** (4 questions): "She ___ play tennis yesterday." → didn't play
3. **Multiple Choice** (3 questions): choosing correct negative past simple forms
4. **True/False** (2 statements): rules about past simple negatives (e.g., "We use 'didn't' with all subjects." → true)
5. **Word Order** (2 sentences): reconstruct negative sentences (e.g., "I didn't win the race.")

### New Lesson 5: `unit6-grammar3` — Past Simple Questions (~11 exercises)

**canDo:** "I can ask and answer questions in the past simple."

**Exercises:**
1. **Grammar table**: Did + subject + base verb? / Short answers (Yes, I did. / No, I didn't.)
2. **Fill-blank** (4 questions): "___ you watch the match?" → Did
3. **Multiple Choice** (3 questions): completing past simple questions and short answers
4. **True/False** (2 statements): rules about past simple questions (e.g., "We use 'did' at the start of past simple questions." → true)
5. **Word Order** (2 sentences): reconstruct question sentences (e.g., "Did you play football yesterday?")

### Target state: 5 lessons, ~35 exercises

---

## Implementation Notes

- All changes are **data-only** — no component or routing changes needed
- New lesson IDs must be globally unique: `unit5-vocab2`, `unit5-grammar3`, `unit6-grammar2`, `unit6-grammar3`
- Exercise IDs follow pattern `<lessonId>-ex<N>` (auto-indexed by position, no explicit IDs in data)
- Lessons are appended to the `lessons` array in each unit's data file
- No UI changes required; existing ExerciseRunner handles all exercise types

## Files to Modify

- `src/data/unit5.js` — append 2 new lessons
- `src/data/unit6.js` — append 2 new lessons
