import { describe, it, expect } from 'vitest';
import { unit7 } from './unit7.js';

describe('unit7 data structure', () => {
  it('has 6 lessons in the correct order', () => {
    const ids = unit7.lessons.map(l => l.id);
    expect(ids).toEqual([
      'unit7-vocab1',
      'unit7-grammar1',
      'unit7-grammar2',
      'unit7-grammar3',
      'unit7-vocab2',
      'unit7-reading1',
    ]);
  });

  it('each lesson has required fields', () => {
    unit7.lessons.forEach(lesson => {
      expect(lesson).toHaveProperty('id');
      expect(lesson).toHaveProperty('type');
      expect(lesson).toHaveProperty('title');
      expect(lesson).toHaveProperty('canDo');
      expect(lesson.exercises).toBeInstanceOf(Array);
      expect(lesson.exercises.length).toBeGreaterThan(0);
    });
  });

  it('fill-blank exercises have exactly one blank', () => {
    unit7.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => {
        if (ex.type === 'fill-blank') {
          const blanks = (ex.template.match(/___/g) || []).length;
          expect(blanks).toBe(1);
        }
      });
    });
  });

  it('word-order words arrays are all-lowercase', () => {
    unit7.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => {
        if (ex.type === 'word-order') {
          ex.words.forEach(word => {
            expect(word).toBe(word.toLowerCase());
          });
        }
      });
    });
  });

  it('unit7-vocab1 flashcard covers all 13 physical appearance words from the doc', () => {
    const vocab1 = unit7.lessons.find(l => l.id === 'unit7-vocab1');
    const flashcard = vocab1.exercises.find(e => e.type === 'flashcard');
    const fronts = flashcard.cards.map(c => c.front);
    const expected = ['bald', 'curly', 'straight', 'wavy', 'freckles', 'beard', 'moustache', 'slim', 'broad-shouldered', 'round', 'oval', 'dark', 'fair'];
    expected.forEach(word => expect(fronts).toContain(word));
  });

  it('unit7-vocab2 life events flashcard covers the 9 doc life events', () => {
    const vocab2 = unit7.lessons.find(l => l.id === 'unit7-vocab2');
    const flashcard = vocab2.exercises.find(e => e.type === 'flashcard');
    const fronts = flashcard.cards.map(c => c.front);
    const expected = ['be born', 'go to school', 'leave school', 'go to university', 'get a job', 'travel abroad', 'get married', 'have children', 'die'];
    expected.forEach(phrase => expect(fronts).toContain(phrase));
  });

  it('reading comprehension has 7 questions', () => {
    const reading = unit7.lessons.find(l => l.id === 'unit7-reading1');
    const rc = reading.exercises.find(e => e.type === 'reading-comprehension');
    expect(rc).toBeDefined();
    expect(rc.questions).toHaveLength(7);
  });

  it('grammar-table exercises have a promptLabel', () => {
    unit7.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => {
        if (ex.type === 'grammar-table') {
          expect(ex).toHaveProperty('promptLabel');
        }
      });
    });
  });
});
