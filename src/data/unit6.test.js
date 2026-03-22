import { describe, it, expect } from 'vitest';
import { unit6 } from './unit6.js';

describe('unit6 data structure', () => {
  it('has 8 lessons in the correct order', () => {
    const ids = unit6.lessons.map(l => l.id);
    expect(ids).toEqual([
      'unit6-vocab1',
      'unit6-vocab2',
      'unit6-grammar1',
      'unit6-grammar2',
      'unit6-vocab3',
      'unit6-grammar3',
      'unit6-grammar4',
      'unit6-reading1',
    ]);
  });

  it('each lesson has required fields', () => {
    unit6.lessons.forEach(lesson => {
      expect(lesson).toHaveProperty('id');
      expect(lesson).toHaveProperty('type');
      expect(lesson).toHaveProperty('title');
      expect(lesson).toHaveProperty('canDo');
      expect(lesson.exercises).toBeInstanceOf(Array);
      expect(lesson.exercises.length).toBeGreaterThan(0);
    });
  });

  it('fill-blank exercises have exactly one blank', () => {
    unit6.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => {
        if (ex.type === 'fill-blank') {
          const blanks = (ex.template.match(/___/g) || []).length;
          expect(blanks).toBe(1);
        }
      });
    });
  });

  it('word-order words arrays are all-lowercase', () => {
    unit6.lessons.forEach(lesson => {
      lesson.exercises.forEach(ex => {
        if (ex.type === 'word-order') {
          ex.words.forEach(word => {
            expect(word).toBe(word.toLowerCase());
          });
        }
      });
    });
  });

  it('unit6-vocab3 flashcard covers all 12 irregular verbs from the doc', () => {
    const vocab3 = unit6.lessons.find(l => l.id === 'unit6-vocab3');
    const flashcard = vocab3.exercises.find(e => e.type === 'flashcard');
    const fronts = flashcard.cards.map(c => c.front);
    const expected = ['win', 'see', 'run', 'come', 'make', 'take', 'begin', 'fall', 'feel', 'ride', 'go', 'become'];
    expected.forEach(verb => expect(fronts).toContain(verb));
    expect(flashcard.cards).toHaveLength(12);
  });

  it('lessons removed from doc are not present', () => {
    const ids = unit6.lessons.map(l => l.id);
    expect(ids).not.toContain('unit6-grammar1b'); // old regular verbs
    expect(ids).not.toContain('unit6-vocab1b');   // old id for collocations
    expect(ids).not.toContain('unit6-grammar0a'); // old id for there was/were
    expect(ids).not.toContain('unit6-grammar0b'); // old id for was/were
    expect(ids).not.toContain('unit6-vocab2b');   // old second irregular verbs
    expect(ids).not.toContain('unit6-grammar5');  // old past time expressions id
  });

  it('reading comprehension has 6 questions', () => {
    const reading = unit6.lessons.find(l => l.id === 'unit6-reading1');
    const rc = reading.exercises.find(e => e.type === 'reading-comprehension');
    expect(rc).toBeDefined();
    expect(rc.questions).toHaveLength(6);
  });
});
