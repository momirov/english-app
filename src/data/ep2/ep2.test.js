import { describe, it, expect } from 'vitest';
import { ep2Units } from './index.js';
import { allUnits as ep1Units } from '../index.js';

// Grows by one id per content task.
const EXPECTED_UNIT_IDS = ['starter', 'unit1', 'unit2', 'unit3', 'unit4', 'unit5'];

const STARTER_SUFFIXES = ['vocab1', 'grammar1', 'vocab2', 'grammar2'];
const UNIT_SUFFIXES = ['vocab1', 'reading', 'grammar1', 'vocab2', 'grammar2', 'speaking', 'writing'];
const LESSON_TYPE_BY_SUFFIX = {
  vocab1: 'vocabulary',
  vocab2: 'vocabulary',
  reading: 'reading',
  grammar1: 'grammar',
  grammar2: 'grammar',
  speaking: 'speaking',
  writing: 'writing',
};

const lessons = ep2Units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));
const exercises = lessons.flatMap(({ unit, lesson }) =>
  lesson.exercises.map((ex, i) => ({ unit, lesson, ex, where: `${lesson.id}[${i}]` }))
);
const ofType = (type) => exercises.filter(({ ex }) => ex.type === type);

describe('ep2 — units', () => {
  it('registers the expected units in order', () => {
    expect(ep2Units.map((u) => u.id)).toEqual(EXPECTED_UNIT_IDS);
  });

  it('each unit has id, integer number, title and hex color', () => {
    ep2Units.forEach((u) => {
      expect(Number.isInteger(u.number), u.id).toBe(true);
      expect(u.title, u.id).toBeTruthy();
      expect(u.color, u.id).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('each unit has the standard lesson sequence', () => {
    ep2Units.forEach((u) => {
      const expected = (u.number === 0 ? STARTER_SUFFIXES : UNIT_SUFFIXES).map((s) => `ep2-${u.id}-${s}`);
      expect(u.lessons.map((l) => l.id)).toEqual(expected);
    });
  });
});

describe('ep2 — lessons', () => {
  it('lesson ids are unique and never collide with Book 1', () => {
    const ids = lessons.map(({ lesson }) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    const ep1Ids = new Set(ep1Units.flatMap((u) => u.lessons.map((l) => l.id)));
    ids.forEach((id) => expect(ep1Ids.has(id), id).toBe(false));
  });

  it('each lesson has title, canDo, matching type, and at least 4 exercises', () => {
    lessons.forEach(({ lesson }) => {
      const suffix = lesson.id.split('-').pop();
      expect(lesson.type, lesson.id).toBe(LESSON_TYPE_BY_SUFFIX[suffix]);
      expect(lesson.title, lesson.id).toBeTruthy();
      expect(lesson.canDo, lesson.id).toMatch(/^I can /);
      expect(lesson.exercises.length, lesson.id).toBeGreaterThanOrEqual(4);
    });
  });
});

describe('ep2 — exercise integrity', () => {
  it('fill-blank: one ___, 3–4 unique wordBank entries containing the answer', () => {
    ofType('fill-blank').forEach(({ ex, where }) => {
      expect((ex.template.match(/___/g) || []).length, where).toBe(1);
      expect(ex.wordBank.length, where).toBeGreaterThanOrEqual(3);
      expect(ex.wordBank.length, where).toBeLessThanOrEqual(4);
      expect(new Set(ex.wordBank).size, where).toBe(ex.wordBank.length);
      expect(ex.wordBank, where).toContain(ex.answer);
    });
  });

  it('multiple-choice: 3–4 unique options containing the answer', () => {
    ofType('multiple-choice').forEach(({ ex, where }) => {
      expect(ex.question, where).toBeTruthy();
      expect(ex.options.length, where).toBeGreaterThanOrEqual(3);
      expect(ex.options.length, where).toBeLessThanOrEqual(4);
      expect(new Set(ex.options).size, where).toBe(ex.options.length);
      expect(ex.options, where).toContain(ex.answer);
    });
  });

  it('multiple-choice: correct-answer position varies within a lesson (3+ MC items)', () => {
    lessons.forEach(({ lesson }) => {
      const mc = lesson.exercises.filter((ex) => ex.type === 'multiple-choice');
      if (mc.length < 3) return;
      const positions = new Set(mc.map((ex) => ex.options.indexOf(ex.answer)));
      expect(positions.size, lesson.id).toBeGreaterThan(1);
    });
  });

  it('matching: 3+ pairs, non-empty, unique left items', () => {
    ofType('matching').forEach(({ ex, where }) => {
      expect(ex.pairs.length, where).toBeGreaterThanOrEqual(3);
      ex.pairs.forEach((p) => {
        expect(p.left, where).toBeTruthy();
        expect(p.right, where).toBeTruthy();
      });
      const lefts = ex.pairs.map((p) => p.left);
      expect(new Set(lefts).size, where).toBe(lefts.length);
    });
  });

  it('flashcard: 4+ cards with non-empty front/back, unique fronts', () => {
    ofType('flashcard').forEach(({ ex, where }) => {
      expect(ex.cards.length, where).toBeGreaterThanOrEqual(4);
      ex.cards.forEach((c) => {
        expect(c.front, where).toBeTruthy();
        expect(c.back, where).toBeTruthy();
      });
      const fronts = ex.cards.map((c) => c.front);
      expect(new Set(fronts).size, where).toBe(fronts.length);
    });
  });

  it('word-order: lowercase words; answer is a permutation of words', () => {
    ofType('word-order').forEach(({ ex, where }) => {
      ex.words.forEach((w) => expect(w, where).toBe(w.toLowerCase()));
      const sortedW = ex.words.map((w) => w.toLowerCase()).sort();
      const sortedA = ex.answer.map((w) => w.toLowerCase()).sort();
      expect(sortedA, where).toEqual(sortedW);
    });
  });

  it('true-false: statement string + boolean answer', () => {
    ofType('true-false').forEach(({ ex, where }) => {
      expect(ex.statement, where).toBeTruthy();
      expect(typeof ex.answer, where).toBe('boolean');
    });
  });

  it('grammar-table: title, promptLabel, non-empty rows', () => {
    ofType('grammar-table').forEach(({ ex, where }) => {
      expect(ex.title, where).toBeTruthy();
      expect(ex.promptLabel, where).toBeTruthy();
      expect(ex.rows.length, where).toBeGreaterThan(0);
      ex.rows.forEach((r) => {
        expect(r.prompt, where).toBeTruthy();
        expect(r.answer, where).toBeTruthy();
      });
    });
  });

  it('reading-comprehension: substantial passage, 4+ well-formed questions', () => {
    ofType('reading-comprehension').forEach(({ ex, where }) => {
      expect(ex.passage.length, where).toBeGreaterThan(400);
      expect(ex.questions.length, where).toBeGreaterThanOrEqual(4);
      ex.questions.forEach((q) => {
        expect(q.question, where).toBeTruthy();
        expect(new Set(q.options).size, where).toBe(q.options.length);
        expect(q.options, where).toContain(q.answer);
      });
    });
  });

  it('each reading lesson contains a reading-comprehension exercise', () => {
    lessons
      .filter(({ lesson }) => lesson.type === 'reading')
      .forEach(({ lesson }) => {
        expect(lesson.exercises.some((ex) => ex.type === 'reading-comprehension'), lesson.id).toBe(true);
      });
  });
});
