# Expand Units 5 and 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 2 new lessons to each of Unit 5 and Unit 6, bringing both from 3 to 5 lessons matching the depth of Unit 4.

**Architecture:** Pure data change — append lesson objects to the `lessons` array in `src/data/unit5.js` and `src/data/unit6.js`. No component, routing, or UI changes needed. All exercise types used already exist and are handled by ExerciseRunner.

**Tech Stack:** Vanilla JS data files (ESM exports). Vite build for validation.

**Spec:** `docs/superpowers/specs/2026-03-22-expand-units-5-6-design.md`

---

## File Map

| File | Change |
|------|--------|
| `src/data/unit5.js` | Append `unit5-vocab2` and `unit5-grammar3` to `lessons` array |
| `src/data/unit6.js` | Append `unit6-grammar2` and `unit6-grammar3` to `lessons` array |

---

## Task 1: Add unit5-vocab2 (Health vocabulary)

**Files:**
- Modify: `src/data/unit5.js`

This lesson has 9 exercises: flashcard, matching, 2× multiple-choice, 2× true-false, 2× fill-blank, 1× word-order.

- [ ] **Step 1: Append the lesson to unit5.js**

Open `src/data/unit5.js`. Before the closing `]` of the `lessons` array (line 133), add a comma after the last lesson and append:

```js
    {
      id: 'unit5-vocab2',
      type: 'vocabulary',
      title: 'Health',
      canDo: 'I can talk about parts of the body and health problems.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'head', back: '🤕 the top part of your body' },
            { front: 'stomach', back: '🤢 the part of your body where food goes' },
            { front: 'back', back: 'the part of your body between your neck and your waist' },
            { front: 'arm', back: '💪 the part between your shoulder and your hand' },
            { front: 'leg', back: '🦵 the part between your hip and your foot' },
            { front: 'throat', back: '😮 the inside of your neck' },
            { front: 'temperature', back: '🌡️ how hot or cold your body is' },
            { front: 'headache', back: '🤕 a pain in your head' },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'head', right: '🤕 the top part of your body' },
            { left: 'stomach', right: '🤢 the part where food goes' },
            { left: 'arm', right: '💪 shoulder to hand' },
            { left: 'leg', right: '🦵 hip to foot' },
            { left: 'throat', right: '😮 inside of your neck' },
            { left: 'headache', right: 'a pain in your head' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'If you have a sore ___, it is difficult to swallow.',
          options: ['throat', 'arm', 'leg', 'stomach'],
          answer: 'throat',
        },
        {
          type: 'multiple-choice',
          question: 'A high ___ can be a sign of illness.',
          options: ['temperature', 'headache', 'stomach', 'back'],
          answer: 'temperature',
        },
        {
          type: 'true-false',
          statement: 'Your stomach is in your head.',
          answer: false,
        },
        {
          type: 'true-false',
          statement: 'You have two arms and two legs.',
          answer: true,
        },
        {
          type: 'fill-blank',
          template: 'I have a ___. My head hurts.',
          wordBank: ['headache', 'stomach', 'temperature'],
          answer: 'headache',
        },
        {
          type: 'fill-blank',
          template: 'She has a sore ___. She can\'t speak.',
          wordBank: ['throat', 'arm', 'back'],
          answer: 'throat',
        },
        {
          type: 'word-order',
          words: ['i', 'have', 'a', 'stomach', 'ache', '.'],
          answer: ['I', 'have', 'a', 'stomach', 'ache', '.'],
        },
      ],
    },
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/vladimir/Projects/english-app && npm run build 2>&1 | head -30
```

Expected: build succeeds with no errors. If it fails, check for missing commas or mismatched braces.

---

## Task 2: Add unit5-grammar3 (should / shouldn't)

**Files:**
- Modify: `src/data/unit5.js`

This lesson has 12 exercises: grammar-table, 4× fill-blank, 3× multiple-choice, 2× true-false, 2× word-order.

- [ ] **Step 1: Append the lesson to unit5.js**

After the `unit5-vocab2` lesson object (still inside the `lessons` array), add a comma and append:

```js
    {
      id: 'unit5-grammar3',
      type: 'grammar',
      title: 'should / shouldn\'t',
      canDo: 'I can use should and shouldn\'t to give health advice.',
      exercises: [
        {
          type: 'grammar-table',
          title: 'should / shouldn\'t',
          rows: [
            { prompt: 'Affirmative (+)', answer: 'You should drink water.' },
            { prompt: 'Negative (−)', answer: 'You shouldn\'t eat too much sugar.' },
            { prompt: 'Question (?)', answer: 'Should I see a doctor?' },
          ],
        },
        {
          type: 'fill-blank',
          template: 'You ___ eat vegetables every day.',
          wordBank: ['should', 'shouldn\'t', 'must'],
          answer: 'should',
        },
        {
          type: 'fill-blank',
          template: 'You ___ stay up very late.',
          wordBank: ['shouldn\'t', 'should', 'can\'t'],
          answer: 'shouldn\'t',
        },
        {
          type: 'fill-blank',
          template: 'She ___ rest if she has a headache.',
          wordBank: ['should', 'shouldn\'t', 'can'],
          answer: 'should',
        },
        {
          type: 'fill-blank',
          template: '___ I take this medicine?',
          wordBank: ['Should', 'Did', 'Was'],
          answer: 'Should',
        },
        {
          type: 'multiple-choice',
          question: 'You ___ drink water when you\'re sick.',
          options: ['should', 'shouldn\'t', 'can\'t', 'don\'t'],
          answer: 'should',
        },
        {
          type: 'multiple-choice',
          question: 'You ___ eat a lot of fast food.',
          options: ['shouldn\'t', 'should', 'must', 'are'],
          answer: 'shouldn\'t',
        },
        {
          type: 'multiple-choice',
          question: 'He has a temperature. He ___ go to school.',
          options: ['shouldn\'t', 'should', 'can', 'will'],
          answer: 'shouldn\'t',
        },
        {
          type: 'true-false',
          statement: '\'Should\' is followed by the infinitive with \'to\'.',
          answer: false,
        },
        {
          type: 'true-false',
          statement: 'We use the same form of \'should\' for all subjects.',
          answer: true,
        },
        {
          type: 'word-order',
          words: ['should', 'you', 'drink', 'more', 'water', '.'],
          answer: ['You', 'should', 'drink', 'more', 'water', '.'],
        },
        {
          type: 'word-order',
          words: ['you', 'shouldn\'t', 'eat', 'late', 'at', 'night', '.'],
          answer: ['You', 'shouldn\'t', 'eat', 'late', 'at', 'night', '.'],
        },
      ],
    },
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/vladimir/Projects/english-app && npm run build 2>&1 | head -30
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit unit5 changes**

```bash
cd /home/vladimir/Projects/english-app
git add src/data/unit5.js
git commit -m "feat: expand unit 5 with Health vocab and should/shouldn't grammar lessons"
```

---

## Task 3: Add unit6-grammar2 (Past Simple Negatives)

**Files:**
- Modify: `src/data/unit6.js`

This lesson has 12 exercises: grammar-table, 4× fill-blank, 3× multiple-choice, 2× true-false, 2× word-order.

- [ ] **Step 1: Append the lesson to unit6.js**

Open `src/data/unit6.js`. Before the closing `]` of the `lessons` array (line 123), add a comma after the last lesson and append:

```js
    {
      id: 'unit6-grammar2',
      type: 'grammar',
      title: 'Past simple: negatives',
      canDo: 'I can use didn\'t to talk about things that didn\'t happen.',
      exercises: [
        {
          type: 'grammar-table',
          title: 'Past simple: negatives',
          rows: [
            { prompt: 'I / You / We / They', answer: 'didn\'t + base verb' },
            { prompt: 'He / She / It', answer: 'didn\'t + base verb' },
            { prompt: 'Example', answer: 'She didn\'t play tennis.' },
          ],
        },
        {
          type: 'fill-blank',
          template: 'She ___ play tennis yesterday.',
          wordBank: ['didn\'t play', 'don\'t play', 'played not'],
          answer: 'didn\'t play',
        },
        {
          type: 'fill-blank',
          template: 'They ___ win the match.',
          wordBank: ['didn\'t win', 'don\'t win', 'not won'],
          answer: 'didn\'t win',
        },
        {
          type: 'fill-blank',
          template: 'I ___ run in the race.',
          wordBank: ['didn\'t run', 'don\'t run', 'ran not'],
          answer: 'didn\'t run',
        },
        {
          type: 'fill-blank',
          template: 'He ___ swim very fast.',
          wordBank: ['didn\'t swim', 'don\'t swim', 'swam not'],
          answer: 'didn\'t swim',
        },
        {
          type: 'multiple-choice',
          question: 'We ___ the match last night.',
          options: ['didn\'t watch', 'don\'t watch', 'watched', 'not watched'],
          answer: 'didn\'t watch',
        },
        {
          type: 'multiple-choice',
          question: 'She ___ to the gym yesterday.',
          options: ['didn\'t go', 'don\'t go', 'not went', 'didn\'t went'],
          answer: 'didn\'t go',
        },
        {
          type: 'multiple-choice',
          question: 'They ___ any goals.',
          options: ['didn\'t score', 'don\'t score', 'scored not', 'didn\'t scored'],
          answer: 'didn\'t score',
        },
        {
          type: 'true-false',
          statement: 'We use \'didn\'t\' with all subjects in the past simple.',
          answer: true,
        },
        {
          type: 'true-false',
          statement: 'We add \'-ed\' to the verb after \'didn\'t\'.',
          answer: false,
        },
        {
          type: 'word-order',
          words: ['i', 'didn\'t', 'win', 'the', 'race', '.'],
          answer: ['I', 'didn\'t', 'win', 'the', 'race', '.'],
        },
        {
          type: 'word-order',
          words: ['we', 'didn\'t', 'play', 'football', 'yesterday', '.'],
          answer: ['We', 'didn\'t', 'play', 'football', 'yesterday', '.'],
        },
      ],
    },
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/vladimir/Projects/english-app && npm run build 2>&1 | head -30
```

Expected: build succeeds with no errors.

---

## Task 4: Add unit6-grammar3 (Past Simple Questions)

**Files:**
- Modify: `src/data/unit6.js`

This lesson has 12 exercises: grammar-table, 4× fill-blank, 3× multiple-choice, 2× true-false, 2× word-order.

- [ ] **Step 1: Append the lesson to unit6.js**

After the `unit6-grammar2` lesson object (still inside the `lessons` array), add a comma and append:

```js
    {
      id: 'unit6-grammar3',
      type: 'grammar',
      title: 'Past simple: questions',
      canDo: 'I can ask and answer questions in the past simple.',
      exercises: [
        {
          type: 'grammar-table',
          title: 'Past simple: questions',
          rows: [
            { prompt: 'Question', answer: 'Did + subject + base verb?' },
            { prompt: 'Short answer (+)', answer: 'Yes, I / you / he / she / we / they did.' },
            { prompt: 'Short answer (−)', answer: 'No, I / you / he / she / we / they didn\'t.' },
          ],
        },
        {
          type: 'fill-blank',
          template: '___ you watch the match?',
          wordBank: ['Did', 'Do', 'Was'],
          answer: 'Did',
        },
        {
          type: 'fill-blank',
          template: 'Did she ___ in the race?',
          wordBank: ['run', 'ran', 'running'],
          answer: 'run',
        },
        {
          type: 'fill-blank',
          template: '___ they win the cup?',
          wordBank: ['Did', 'Do', 'Were'],
          answer: 'Did',
        },
        {
          type: 'fill-blank',
          template: 'Did he ___ football at school?',
          wordBank: ['play', 'played', 'playing'],
          answer: 'play',
        },
        {
          type: 'multiple-choice',
          question: '___ you go to the gym?',
          options: ['Did', 'Do', 'Was', 'Were'],
          answer: 'Did',
        },
        {
          type: 'multiple-choice',
          question: 'Did she win? Yes, she ___.',
          options: ['did', 'didn\'t', 'does', 'was'],
          answer: 'did',
        },
        {
          type: 'multiple-choice',
          question: 'Did they score? No, they ___.',
          options: ['didn\'t', 'did', 'don\'t', 'weren\'t'],
          answer: 'didn\'t',
        },
        {
          type: 'true-false',
          statement: 'We use \'did\' at the start of past simple questions.',
          answer: true,
        },
        {
          type: 'true-false',
          statement: 'We add \'-ed\' to the verb in past simple questions.',
          answer: false,
        },
        {
          type: 'word-order',
          words: ['did', 'you', 'play', 'football', 'yesterday', '?'],
          answer: ['Did', 'you', 'play', 'football', 'yesterday', '?'],
        },
        {
          type: 'word-order',
          words: ['did', 'she', 'win', 'the', 'race', '?'],
          answer: ['Did', 'she', 'win', 'the', 'race', '?'],
        },
      ],
    },
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/vladimir/Projects/english-app && npm run build 2>&1 | head -30
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit unit6 changes**

```bash
cd /home/vladimir/Projects/english-app
git add src/data/unit6.js
git commit -m "feat: expand unit 6 with past simple negatives and questions grammar lessons"
```
