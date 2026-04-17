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
        expect(new Set(ex.wordBank).size).toBe(4);
      }
    });
  });

  it('multiple-choice exercises have 4 options with answer in options', () => {
    forEachExercise(ex => {
      if (ex.type === 'multiple-choice') {
        expect(ex.options).toHaveLength(4);
        expect(ex.options).toContain(ex.answer);
        expect(new Set(ex.options).size).toBe(4);
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

  it('grammar-table has non-empty title, promptLabel, and row prompt/answer strings', () => {
    forEachExercise(ex => {
      if (ex.type === 'grammar-table') {
        expect(typeof ex.title).toBe('string');
        expect(ex.title.length).toBeGreaterThan(0);
        expect(typeof ex.promptLabel).toBe('string');
        expect(ex.promptLabel.length).toBeGreaterThan(0);
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
