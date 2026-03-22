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

## Data Model Conventions

- **`multiple-choice`**: `options` array of exactly 4 strings; one matches `answer`.
- **`fill-blank`**: `wordBank` array of 3–5 strings including the correct `answer`.
- **`word-order`**: `words` array all-lowercase (even "I"). `answer` array capitalises first word only. Both are arrays, not strings.
- **`grammar-table`**: has a `title` string. Rows use `{ prompt, answer }` shape.
- **`true-false`**: `answer` is boolean.
- **Lesson `type`**: `'vocabulary'` or `'grammar'`.

---

## Unit 5: Food and Health

### Current state (3 lessons, 15 exercises)
1. `unit5-vocab1` — Food vocabulary
2. `unit5-grammar1` — Countable and Uncountable Nouns
3. `unit5-grammar2` — much, many, a lot of

---

### New Lesson 4: `unit5-vocab2` — Health
**type:** `'vocabulary'`
**title:** `"Health"`
**canDo:** `"I can talk about parts of the body and health problems."`
**Total exercises: 9**

#### Exercise 1 — Flashcard (8 cards)
| Front | Back |
|-------|------|
| head | 🤕 the top part of your body |
| stomach | 🤢 the part of your body where food goes |
| back | the part of your body between your neck and your waist |
| arm | 💪 the part between your shoulder and your hand |
| leg | 🦵 the part between your hip and your foot |
| throat | 😮 the inside of your neck |
| temperature | 🌡️ how hot or cold your body is |
| headache | 🤕 a pain in your head |

#### Exercise 2 — Matching (6 pairs)
| Left | Right |
|------|-------|
| head | 🤕 the top part of your body |
| stomach | 🤢 the part where food goes |
| arm | 💪 shoulder to hand |
| leg | 🦵 hip to foot |
| throat | 😮 inside of your neck |
| headache | a pain in your head |

#### Exercise 3 — Multiple Choice
- template: `"If you have a sore ___, it is difficult to swallow."`
- options: `["throat", "arm", "leg", "stomach"]`
- answer: `"throat"`

#### Exercise 4 — Multiple Choice
- template: `"A high ___ can be a sign of illness."`
- options: `["temperature", "headache", "stomach", "back"]`
- answer: `"temperature"`

#### Exercise 5 — True/False
- statement: `"Your stomach is in your head."`
- answer: `false`

#### Exercise 6 — True/False
- statement: `"You have two arms and two legs."`
- answer: `true`

#### Exercise 7 — Fill-blank
- template: `"I have a ___. My head hurts."`
- wordBank: `["headache", "stomach", "temperature"]`
- answer: `"headache"`

#### Exercise 8 — Fill-blank
- template: `"She has a sore ___. She can't speak."`
- wordBank: `["throat", "arm", "back"]`
- answer: `"throat"`

#### Exercise 9 — Word Order
- words: `['i', 'have', 'a', 'stomach', 'ache', '.']`
- answer: `['I', 'have', 'a', 'stomach', 'ache', '.']`

---

### New Lesson 5: `unit5-grammar3` — should / shouldn't
**type:** `'grammar'`
**title:** `"should / shouldn't"`
**canDo:** `"I can use should and shouldn't to give health advice."`
**Total exercises: 12**

#### Exercise 1 — Grammar Table
- title: `"should / shouldn't"`
- rows:
  - `{ prompt: "Affirmative (+)", answer: "You should drink water." }`
  - `{ prompt: "Negative (−)", answer: "You shouldn't eat too much sugar." }`
  - `{ prompt: "Question (?)", answer: "Should I see a doctor?" }`

#### Exercise 2 — Fill-blank
- template: `"You ___ eat vegetables every day."`
- wordBank: `["should", "shouldn't", "must"]`
- answer: `"should"`

#### Exercise 3 — Fill-blank
- template: `"You ___ stay up very late."`
- wordBank: `["shouldn't", "should", "can't"]`
- answer: `"shouldn't"`

#### Exercise 4 — Fill-blank
- template: `"She ___ rest if she has a headache."`
- wordBank: `["should", "shouldn't", "can"]`
- answer: `"should"`

#### Exercise 5 — Fill-blank
- template: `"___ I take this medicine?"`
- wordBank: `["Should", "Did", "Was"]`
- answer: `"Should"`

#### Exercise 6 — Multiple Choice
- template: `"You ___ drink water when you're sick."`
- options: `["should", "shouldn't", "can't", "don't"]`
- answer: `"should"`

#### Exercise 7 — Multiple Choice
- template: `"You ___ eat a lot of fast food."`
- options: `["shouldn't", "should", "must", "are"]`
- answer: `"shouldn't"`

#### Exercise 8 — Multiple Choice
- template: `"He has a temperature. He ___ go to school."`
- options: `["shouldn't", "should", "can", "will"]`
- answer: `"shouldn't"`

#### Exercise 9 — True/False
- statement: `"'Should' is followed by the infinitive with 'to'."`
- answer: `false`

#### Exercise 10 — True/False
- statement: `"We use the same form of 'should' for all subjects."`
- answer: `true`

#### Exercise 11 — Word Order
- words: `['should', 'you', 'drink', 'more', 'water', '.']`
- answer: `['You', 'should', 'drink', 'more', 'water', '.']`

#### Exercise 12 — Word Order
- words: `['you', "shouldn't", 'eat', 'late', 'at', 'night', '.']`
- answer: `['You', "shouldn't", 'eat', 'late', 'at', 'night', '.']`

---

### Unit 5 target state: 5 lessons, 36 exercises

---

## Unit 6: Sport

### Current state (3 lessons, 13 exercises)
1. `unit6-vocab1` — Sports vocabulary
2. `unit6-grammar1` — Past Simple (Regular Verbs)
3. `unit6-vocab2` — Irregular Verbs

---

### New Lesson 4: `unit6-grammar2` — Past Simple Negatives
**type:** `'grammar'`
**title:** `"Past simple: negatives"`
**canDo:** `"I can use didn't to talk about things that didn't happen."`
**Total exercises: 12**

#### Exercise 1 — Grammar Table
- title: `"Past simple: negatives"`
- rows:
  - `{ prompt: "I / You / We / They", answer: "didn't + base verb" }`
  - `{ prompt: "He / She / It", answer: "didn't + base verb" }`
  - `{ prompt: "Example", answer: "She didn't play tennis." }`

#### Exercise 2 — Fill-blank
- template: `"She ___ play tennis yesterday."`
- wordBank: `["didn't play", "don't play", "played not"]`
- answer: `"didn't play"`

#### Exercise 3 — Fill-blank
- template: `"They ___ win the match."`
- wordBank: `["didn't win", "don't win", "not won"]`
- answer: `"didn't win"`

#### Exercise 4 — Fill-blank
- template: `"I ___ run in the race."`
- wordBank: `["didn't run", "don't run", "ran not"]`
- answer: `"didn't run"`

#### Exercise 5 — Fill-blank
- template: `"He ___ swim very fast."`
- wordBank: `["didn't swim", "don't swim", "swam not"]`
- answer: `"didn't swim"`

#### Exercise 6 — Multiple Choice
- template: `"We ___ the match last night."`
- options: `["didn't watch", "don't watch", "watched", "not watched"]`
- answer: `"didn't watch"`

#### Exercise 7 — Multiple Choice
- template: `"She ___ to the gym yesterday."`
- options: `["didn't go", "don't go", "not went", "didn't went"]`
- answer: `"didn't go"`

#### Exercise 8 — Multiple Choice
- template: `"They ___ any goals."`
- options: `["didn't score", "don't score", "scored not", "didn't scored"]`
- answer: `"didn't score"`

#### Exercise 9 — True/False
- statement: `"We use 'didn't' with all subjects in the past simple."`
- answer: `true`

#### Exercise 10 — True/False
- statement: `"We add '-ed' to the verb after 'didn't'."`
- answer: `false`

#### Exercise 11 — Word Order
- words: `['i', "didn't", 'win', 'the', 'race', '.']`
- answer: `['I', "didn't", 'win', 'the', 'race', '.']`

#### Exercise 12 — Word Order
- words: `['we', "didn't", 'play', 'football', 'yesterday', '.']`
- answer: `['We', "didn't", 'play', 'football', 'yesterday', '.']`

---

### New Lesson 5: `unit6-grammar3` — Past Simple Questions
**type:** `'grammar'`
**title:** `"Past simple: questions"`
**canDo:** `"I can ask and answer questions in the past simple."`
**Total exercises: 12**

#### Exercise 1 — Grammar Table
- title: `"Past simple: questions"`
- rows:
  - `{ prompt: "Question", answer: "Did + subject + base verb?" }`
  - `{ prompt: "Short answer (+)", answer: "Yes, I / you / he / she / we / they did." }`
  - `{ prompt: "Short answer (−)", answer: "No, I / you / he / she / we / they didn't." }`

#### Exercise 2 — Fill-blank
- template: `"___ you watch the match?"`
- wordBank: `["Did", "Do", "Was"]`
- answer: `"Did"`

#### Exercise 3 — Fill-blank
- template: `"Did she ___ in the race?"`
- wordBank: `["run", "ran", "running"]`
- answer: `"run"`

#### Exercise 4 — Fill-blank
- template: `"___ they win the cup?"`
- wordBank: `["Did", "Do", "Were"]`
- answer: `"Did"`

#### Exercise 5 — Fill-blank
- template: `"Did he ___ football at school?"`
- wordBank: `["play", "played", "playing"]`
- answer: `"play"`

#### Exercise 6 — Multiple Choice
- template: `"___ you go to the gym?"`
- options: `["Did", "Do", "Was", "Were"]`
- answer: `"Did"`

#### Exercise 7 — Multiple Choice
- template: `"Did she win? Yes, she ___."`
- options: `["did", "didn't", "does", "was"]`
- answer: `"did"`

#### Exercise 8 — Multiple Choice
- template: `"Did they score? No, they ___."`
- options: `["didn't", "did", "don't", "weren't"]`
- answer: `"didn't"`

#### Exercise 9 — True/False
- statement: `"We use 'did' at the start of past simple questions."`
- answer: `true`

#### Exercise 10 — True/False
- statement: `"We add '-ed' to the verb in past simple questions."`
- answer: `false`

#### Exercise 11 — Word Order
- words: `['did', 'you', 'play', 'football', 'yesterday', '?']`
- answer: `['Did', 'you', 'play', 'football', 'yesterday', '?']`

#### Exercise 12 — Word Order
- words: `['did', 'she', 'win', 'the', 'race', '?']`
- answer: `['Did', 'she', 'win', 'the', 'race', '?']`

---

### Unit 6 target state: 5 lessons, 37 exercises

---

## Files to Modify

- `src/data/unit5.js` — append 2 new lessons (`unit5-vocab2`, `unit5-grammar3`)
- `src/data/unit6.js` — append 2 new lessons (`unit6-grammar2`, `unit6-grammar3`)
