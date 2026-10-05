import { describe, it, expect } from 'vitest';
import { books, findBook, legacyRedirectTarget } from './books.js';
import { allUnits } from './index.js';
import { irregular } from './irregular.js';

describe('books registry', () => {
  it('lists Book 1 then Book 2', () => {
    expect(books.map((b) => b.id)).toEqual(['ep1', 'ep2']);
    expect(books.map((b) => b.title)).toEqual(['English Plus 1', 'English Plus 2']);
  });

  it('Book 1 uses the existing allUnits list', () => {
    expect(findBook('ep1').units).toBe(allUnits);
  });

  it('Irregular verbs is the last unit of both books (same object)', () => {
    books.forEach((b) => expect(b.units[b.units.length - 1]).toBe(irregular));
  });

  it('every book has level and hex color', () => {
    books.forEach((b) => {
      expect(b.level).toBeTruthy();
      expect(b.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('findBook returns undefined for unknown ids', () => {
    expect(findBook('nope')).toBeUndefined();
  });
});

describe('legacyRedirectTarget', () => {
  it('prefixes Book 1 unit paths with /ep1', () => {
    expect(legacyRedirectTarget('/unit5')).toBe('/ep1/unit5');
    expect(legacyRedirectTarget('/unit5/unit5-vocab1/3')).toBe('/ep1/unit5/unit5-vocab1/3');
    expect(legacyRedirectTarget('/starter')).toBe('/ep1/starter');
    expect(legacyRedirectTarget('/irregular/irregular-1')).toBe('/ep1/irregular/irregular-1');
  });

  it('sends unknown paths home', () => {
    expect(legacyRedirectTarget('/nope')).toBe('/');
    expect(legacyRedirectTarget('/nope/unit5')).toBe('/');
    expect(legacyRedirectTarget('/')).toBe('/');
  });
});
