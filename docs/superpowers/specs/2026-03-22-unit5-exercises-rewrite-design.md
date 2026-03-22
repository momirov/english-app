# Unit 5 Exercises Rewrite — Design Spec

**Date:** 2026-03-22
**Status:** Approved
**Source doc:** `docs/unit5_exercises.md`

---

## Overview

Full rewrite of `src/data/unit5.js` to align with the authoritative exercises document. The existing 5-lesson structure is replaced with 6 lessons that directly reflect the doc. Unit metadata (id, title, color) is unchanged.

**Removed lessons (all content discarded):**
- old `unit5-grammar2` (much/many/a lot of) → content merged into new `unit5-grammar1`; ID repurposed for Verb+-ing
- old `unit5-vocab2` (body parts) → replaced by health adjectives; ID reused
- old `unit5-grammar3` (should/shouldn't) → removed; ID repurposed for Imperatives

> Any saved user progress against these IDs will be invalidated — acceptable for a content update.

---

## Lesson Structure

| ID | Title | Type |
|---|---|---|
| `unit5-vocab1` | Food vocabulary | vocabulary |
| `unit5-grammar1` | Countable & uncountable nouns / some, any, much, many, a lot of | grammar |
| `unit5-grammar2` | Verb + -ing | grammar |
| `unit5-grammar3` | Imperatives | grammar |
| `unit5-vocab2` | Health adjectives | vocabulary |
| `unit5-reading1` | Reading: Marathon runners | reading |

---

## Constraint: one blank per `fill-blank` exercise

The `fill-blank` component splits on `___` and handles exactly one blank per template. Every `fill-blank` exercise must have exactly one `___` in its `template`. No exceptions.

---

## Exercise Breakdown

### unit5-vocab1 — Food vocabulary
**canDo:** I can name and categorise common food and drink items.

**`flashcard`** — all 14 words from doc Ex.1 word box. `front` = word, `back` = short definition:
```
pasta        → 🍝 Italian food made from flour and water
grapes       → 🍇 small round fruit that grow in bunches
lemonade     → 🍋 a cold drink made with lemon juice and sugar
lamb         → 🥩 meat from a young sheep
almonds      → 🌰 small hard nuts with a light brown shell
broccoli     → 🥦 a green vegetable with a tree-like shape
smoothie     → 🥤 a thick cold drink made from blended fruit
popcorn      → 🍿 a snack made from heated corn kernels
tuna         → 🐟 a large fish often eaten in sandwiches or salads
mango        → 🥭 a sweet tropical fruit with orange flesh
herbal tea   → 🍵 a hot drink made from plants, herbs or flowers
peanut butter→ 🥜 a thick paste made from crushed peanuts
oats         → a grain used to make porridge and cereal
prawns       → 🦐 small shellfish with a curved pink body
```

**`matching`** — 6 pairs using the doc category labels (right-side values are category strings from doc Ex.1 column headers; "Snacks / Grains" is one combined label to match the doc):
```
broccoli     → Vegetables
grapes       → Fruit
tuna         → Meat & Fish
lemonade     → Drinks
oats         → Snacks / Grains
almonds      → Snacks / Grains
```
*(Two items share the same right-side value — the app supports duplicate right-side labels as of the relevant fix.)*

**`multiple-choice`** — 2 questions:
1. question: "Which of these is a grain?" options: ['oats','grapes','lemonade','lamb'] answer: 'oats'
2. question: "Which of these is a drink?" options: ['popcorn','broccoli','smoothie','tuna'] answer: 'smoothie'

---

### unit5-grammar1 — Countable & uncountable / some, any, much, many, a lot of
**canDo:** I can use countable and uncountable nouns with the correct quantifier.

**`matching`** — 6 pairs (noun → C or U), exact words from doc Ex.3:
```
cheese      → U
biscuit     → C
rice        → U
strawberry  → C
olive oil   → U
egg         → C
```

**`fill-blank` set 1** (a/an/some/any) — 6 exercises from doc Ex.3 sentences 7–12:
1. template: "I'd like ___ glass of water, please." wordBank: ['a','an','some','any'] answer: 'a'
2. template: "Is there ___ milk in the fridge?" wordBank: ['any','some','a','an'] answer: 'any'
3. template: "There aren't ___ tomatoes left." wordBank: ['any','some','a','many'] answer: 'any'
4. template: "She always has ___ banana for breakfast." wordBank: ['a','an','some','any'] answer: 'a'
5. template: "We haven't got ___ bread." wordBank: ['any','some','a','much'] answer: 'any'
6. template: "Can I have ___ chips with my burger?" wordBank: ['some','any','a','many'] answer: 'some'

**`fill-blank` set 2** (some/any/much/many/a lot of) — 6 exercises adapted from doc Ex.4 dialogue (each a standalone sentence):
1. template: "Have we got ___ eggs for the omelette?" wordBank: ['any','some','many','much'] answer: 'any'
2. template: "We haven't got ___ eggs left." wordBank: ['any','some','many','a lot of'] answer: 'any'
3. template: "There's ___ cheese in the fridge." wordBank: ['a lot of','many','much','any'] answer: 'a lot of'
4. template: "How ___ tomatoes are there?" wordBank: ['many','much','a lot of','some'] answer: 'many'
5. template: "We don't need ___ bread." wordBank: ['much','many','a lot of','some'] answer: 'much'
6. template: "Can you get ___ chocolate, please?" wordBank: ['some','any','many','much'] answer: 'some'

**`true-false`** — 2 statements:
1. statement: "We use 'any' in negative sentences and questions." answer: true
2. statement: "We use 'much' with countable nouns." answer: false

**`multiple-choice`** — 2 questions:
1. question: "How ___ sugar do you want?" options: ['many','much','a lot','lots'] answer: 'much'
2. question: "How ___ eggs do we need?" options: ['much','many','a lot','lots'] answer: 'many'

---

### unit5-grammar2 — Verb + -ing
**canDo:** I can use love, like, don't mind and hate with a verb + -ing.

**`grammar-table`** — `title: 'Verb + -ing'`, `promptLabel: 'Verb'`. 4 rows (student types the example sentence — keep answers short, all first-person for consistency):
```
prompt: 'love'        answer: 'I love cooking.'
prompt: 'like'        answer: 'I like helping.'
prompt: "don't mind"  answer: "I don't mind getting up early."
prompt: 'hate'        answer: 'I hate running.'
```
*(Answers are checked case-insensitively. Students type the example sentence as shown.)*

**`fill-blank`** — 4 exercises from doc Ex.5 Part A:
1. template: "She doesn't enjoy ___." wordBank: ['running','run','ran'] answer: 'running'
2. template: "I love ___ Italian food." wordBank: ['cook','cooking','cooked'] answer: 'cooking'
3. template: "He hates ___ up early." wordBank: ['get','getting','got'] answer: 'getting'
4. template: "Do you like ___ in the kitchen?" wordBank: ['help','helped','helping'] answer: 'helping'

**`multiple-choice`** — 2 questions:
1. question: "She loves ___ to music." options: ['listen','listening','listened','listens'] answer: 'listening'
2. question: "After 'hate', we use the verb in the ___ form." options: ['infinitive','past simple','gerund (-ing)','present simple'] answer: 'gerund (-ing)'

**`word-order`** — 2 exercises (`words` arrays are all-lowercase, including `'i'` for the pronoun and common adjectives like `'italian'`; `answer` arrays use correct capitalisation):
1. words: ['enjoy',"doesn't",'she','in','the','mornings','running','.'] answer: ['She',"doesn't",'enjoy','running','in','the','mornings','.']
2. words: ['cooking','love','i','italian','food','.'] answer: ['I','love','cooking','Italian','food','.']

---

### unit5-grammar3 — Imperatives
**canDo:** I can use affirmative and negative imperatives to give instructions and advice.

**`grammar-table`** — `title: 'Imperatives'`, `promptLabel: 'Type'`. 2 rows:
```
prompt: 'Affirmative (+)'  answer: 'Drink plenty of water.'
prompt: 'Negative (−)'     answer: "Don't skip breakfast."
```

**`fill-blank`** — 6 exercises from doc Ex.6 (word bank contains only the verb, student selects it; the Don't is part of the template where applicable):
1. template: "___ at least eight hours every night." wordBank: ['Sleep','Eat','Drink','Go'] answer: 'Sleep'
2. template: "Don't ___ breakfast!" wordBank: ['skip','eat','drink','buy'] answer: 'skip'
3. template: "Don't ___ junk food at the school canteen." wordBank: ['buy','eat','drink','go'] answer: 'buy'
4. template: "___ plenty of water throughout the day." wordBank: ['Drink','Eat','Sleep','Buy'] answer: 'Drink'
5. template: "___ fruit and vegetables every day." wordBank: ['Eat','Drink','Sleep','Buy'] answer: 'Eat'
6. template: "Don't ___ to bed very late on school nights." wordBank: ['go','eat','drink','sleep'] answer: 'go'

**`multiple-choice`** — 2 questions:
1. question: "Which is a correct negative imperative?" options: ["Don't eating","Not eat","Don't eat","Doesn't eat"] answer: "Don't eat"
2. question: "Imperatives use the ___ form of the verb." options: ['base form (infinitive)','past simple','gerund (-ing)','present simple'] answer: 'base form (infinitive)'

**`true-false`** — 2 statements:
1. statement: "The negative imperative uses 'Don't' + base verb." answer: true
2. statement: "We add '-s' to the verb in imperatives for he/she/it." answer: false

---

### unit5-vocab2 — Health adjectives
**canDo:** I can use adjectives to describe how someone feels or their level of fitness.

**`flashcard`** — 9 cards (all 9 words from doc Ex.7 word box):
```
fit        → in good physical condition from regular exercise
tired      → feeling you need to sleep or rest
unhealthy  → not good for your body; full of fat, sugar or bad habits
thirsty    → feeling that you need to drink something
active     → doing a lot of physical activity; moving around regularly
lazy       → not wanting to work or do any physical activity
hungry     → feeling that you need to eat something
well       → healthy; not ill
unfit      → not in good physical condition; unable to exercise easily
```

**`fill-blank`** — 7 exercises from doc Ex.7 (one blank per sentence, each with a 4-word word bank):
1. template: "I haven't had anything to drink all day. I'm really ___." wordBank: ['thirsty','hungry','tired','unfit'] answer: 'thirsty'
2. template: "My sister goes to the gym every day. She's very ___." wordBank: ['fit','lazy','tired','unfit'] answer: 'fit'
3. template: "That diet is full of sugar and fat. It sounds really ___." wordBank: ['unhealthy','fit','active','well'] answer: 'unhealthy'
4. template: "He stayed up until 2 a.m. and now he can't concentrate. He's so ___." wordBank: ['tired','lazy','fit','active'] answer: 'tired'
5. template: "I haven't moved from the sofa all weekend. I'm becoming really ___." wordBank: ['lazy','tired','unfit','hungry'] answer: 'lazy'
6. template: "I skipped lunch and now my stomach is growling. I'm so ___." wordBank: ['hungry','thirsty','tired','lazy'] answer: 'hungry'
7. template: "She's been ill all week, but she finally feels ___ again." wordBank: ['well','fit','active','unfit'] answer: 'well'

**`matching`** — 6 pairs covering adjectives not fully exercised in fill-blank (adjective → short definition):
```
active  → doing lots of physical activity
unfit   → not in good physical condition
thirsty → needing something to drink
fit     → in good physical shape
well    → healthy; not ill
lazy    → not wanting to work or exercise
```

**`multiple-choice`** — 2 questions:
1. question: "She runs every day and goes to the gym. She is very ___." options: ['lazy','tired','fit','unfit'] answer: 'fit'
2. question: "The opposite of 'fit' is ___." options: ['well','unfit','active','healthy'] answer: 'unfit'

---

### unit5-reading1 — Reading: Marathon runners
**canDo:** I can read a short text and identify whether statements are true, false, or not given.

**`reading-comprehension`** — one exercise with:

**passage** (verbatim from doc Ex.8):
> Most marathon runners train for many months before a race. They eat a lot of carbohydrates — such as pasta, rice and bread — because these foods give them energy. They don't eat much fat, but they do eat plenty of protein, such as chicken or fish, to help their muscles recover after training. Runners drink a lot of water every day. They don't drink many fizzy drinks because these can hurt their performance. Many runners also take vitamins. The night before a race, it is common to eat a big pasta meal. This is sometimes called "carb loading."

**questions** — 6 items, each with `options: ['True', 'False', 'Not Given']`:
```
1. "Marathon runners train for a few days before a race."   → 'False'
2. "Pasta and rice give runners energy."                    → 'True'
3. "Runners eat a lot of fat."                              → 'False'
4. "Fizzy drinks are good for runners' performance."        → 'False'
5. "All runners take vitamins."                             → 'Not Given'
6. "Runners sometimes eat a lot of pasta the night before." → 'True'
```

---

## Implementation Notes

- **Single file change:** only `src/data/unit5.js` is modified.
- **No new components needed:** all types (`flashcard`, `matching`, `fill-blank`, `multiple-choice`, `true-false`, `word-order`, `grammar-table`, `reading-comprehension`) already exist.
- **T/F/NG encoding:** The `reading-comprehension` component accepts `{ question, options, answer }`. T/F/NG statements become questions with `options: ['True', 'False', 'Not Given']` and string answers `'True'` / `'False'` / `'Not Given'`.
- **`grammar-table` answers:** Checked case-insensitively against student free-text input. Keep answers short and unambiguous as specified above.
- **`promptLabel`:** Both grammar-table exercises include a `promptLabel` field (`'Verb'` for Verb+-ing, `'Type'` for Imperatives) to avoid the default `'Subject'` header which is semantically wrong for these exercises.
- **Duplicate matching values:** vocab1 matching has two items pointing to `'Snacks / Grains'` — supported by the app.
- **`word-order` capitalisation:** `words` arrays are all-lowercase including pronouns (`'i'`) and proper adjectives (`'italian'`); `answer` arrays use correct sentence capitalisation. This matches codebase convention (e.g. `['stomach', 'a', 'ache', 'have', 'i', '.']`).
- **One blank per `fill-blank`:** every `template` string has exactly one `___`.

---

## Out of Scope

- Writing exercise (doc Ex.9) — skipped; open-ended production not evaluable digitally.
- Odd One Out exercise (doc Ex.2) — no matching exercise type in the app.
- No new components, routes, or unit metadata changes.
