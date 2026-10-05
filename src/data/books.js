import { allUnits as ep1Units } from './index.js';
import { irregular } from './irregular.js';
import { ep2Units } from './ep2/index.js';

export const books = [
  { id: 'ep1', title: 'English Plus 1', level: 'A1–A2', color: '#2980b9', units: ep1Units },
  { id: 'ep2', title: 'English Plus 2', level: 'A2', color: '#c0392b', units: [...ep2Units, irregular] },
];

export function findBook(id) {
  return books.find((b) => b.id === id);
}

// Pre-book URLs looked like /unit5/unit5-vocab1/3. Map them onto Book 1.
export function legacyRedirectTarget(path) {
  const first = path.split('/').filter(Boolean)[0];
  if (first && findBook('ep1').units.some((u) => u.id === first)) return `/ep1${path}`;
  return '/';
}
