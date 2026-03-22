import { describe, it, expect } from 'vitest';
import { unit5 } from './unit5.js';

describe('unit5 data structure', () => {
  it('has 6 lessons in the correct order', () => {
    const ids = unit5.lessons.map(l => l.id);
    expect(ids).toEqual([
      'unit5-vocab1',
      'unit5-grammar1',
      'unit5-grammar2',
      'unit5-grammar3',
      'unit5-vocab2',
      'unit5-reading1',
    ]);
  });

  it('each lesson has required fields', () => {
    unit5.lessons.forEach(lesson => {
      expect(lesson).toHaveProperty('id');
      expect(lesson).toHaveProperty('type');
      expect(lesson).toHaveProperty('title');
      expect(lesson).toHaveProperty('canDo');
      expect(lesson.exercises).toBeInstanceOf(Array);
      expect(lesson.exercises.length).toBeGreaterThan(0);
    });
  });

  it('fill-blank exercises have exactly one blank', () => {
    unit5.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => {
        if (ex.type === 'fill-blank') {
          const blanks = (ex.template.match(/___/g) || []).length;
          expect(blanks).toBe(1);
        }
      });
    });
  });

  it('grammar-table exercises have a promptLabel', () => {
    unit5.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => {
        if (ex.type === 'grammar-table') {
          expect(ex).toHaveProperty('promptLabel');
          expect(typeof ex.promptLabel).toBe('string');
        }
      });
    });
  });

  it('word-order words arrays are all-lowercase', () => {
    unit5.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => {
        if (ex.type === 'word-order') {
          ex.words.forEach(word => {
            expect(word).toBe(word.toLowerCase());
          });
        }
      });
    });
  });

  it('reading comprehension uses True/False/Not Given options', () => {
    const reading = unit5.lessons.find(l => l.id === 'unit5-reading1');
    const rc = reading.exercises.find(e => e.type === 'reading-comprehension');
    expect(rc).toBeDefined();
    expect(rc.passage.length).toBeGreaterThan(0);
    expect(rc.questions).toHaveLength(6);
    rc.questions.forEach(q => {
      expect(q.options).toEqual(['True', 'False', 'Not Given']);
      expect(['True', 'False', 'Not Given']).toContain(q.answer);
    });
  });

  it('unit5-vocab1 flashcard has all 14 food words', () => {
    const vocab1 = unit5.lessons.find(l => l.id === 'unit5-vocab1');
    const flashcard = vocab1.exercises.find(e => e.type === 'flashcard');
    const fronts = flashcard.cards.map(c => c.front);
    const expected = [
      'pasta', 'grapes', 'lemonade', 'lamb', 'almonds', 'broccoli',
      'smoothie', 'popcorn', 'tuna', 'mango', 'herbal tea', 'peanut butter',
      'oats', 'prawns',
    ];
    expected.forEach(word => expect(fronts).toContain(word));
    expect(flashcard.cards).toHaveLength(14);
  });

  it('unit5-vocab2 flashcard has all 9 health adjectives', () => {
    const vocab2 = unit5.lessons.find(l => l.id === 'unit5-vocab2');
    const flashcard = vocab2.exercises.find(e => e.type === 'flashcard');
    const fronts = flashcard.cards.map(c => c.front);
    const expected = ['fit', 'tired', 'unhealthy', 'thirsty', 'active', 'lazy', 'hungry', 'well', 'unfit'];
    expected.forEach(word => expect(fronts).toContain(word));
    expect(flashcard.cards).toHaveLength(9);
  });
});
