// Short curated word list — unambiguous, no profanity, easy to say aloud.
const WORDS = [
  'ACE','APE','ARC','ASH','BAY','BEE','BOX','CAP','CAT','COW',
  'CUP','DAY','DOG','DOT','ELF','ELK','ELM','FAN','FIG','FIN',
  'FIR','FOG','FOX','GEM','HAT','HAY','HEN','HUB','ICE','INK',
  'JAM','JAR','JET','KEY','KID','KIN','LAB','LAD','LID','LIP',
  'LOG','MAP','MAT','MIX','MOM','MUG','NET','NUN','NUT','OAK',
  'OAR','OWL','PAD','PEA','PEN','PIE','PIG','PIN','PIT','PLUM',
  'POD','POT','RAM','RAT','RED','RIB','RIM','ROW','RUG','SKY',
  'SUN','TAB','TAN','TEA','TIE','TIN','TOE','TOP','TOY','TUB',
  'VAN','WEB','WIG','YAK','YAM','ZAP','ZIP',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRoomCode() {
  const a = pick(WORDS);
  const b = pick(WORDS);
  const n = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${a}-${b}-${n}`;
}

export function isValidRoomCode(s) {
  if (typeof s !== 'string') return false;
  return /^[A-Z]+-[A-Z]+-\d{2}$/.test(s);
}
