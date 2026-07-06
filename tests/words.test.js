// Run with: node --test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { WORD_LIST, HARD_WORDS, makeWords } = require('../src/words.js');

// Returns the given values in order, then fails loudly if over-consumed.
const scriptedRng = (values) => {
  let i = 0;
  return () => {
    if (i >= values.length) throw new Error('scripted rng exhausted after ' + values.length + ' calls');
    return values[i++];
  };
};

test('index.html loads the modules and carries no inline copies', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.includes('src="./src/words.js"'), 'words module script tag missing');
  assert.ok(html.includes('src="./src/scoring.js"'), 'scoring module script tag missing');
  assert.ok(!html.includes('const WORD_LIST'), 'inline WORD_LIST should be gone');
  assert.ok(!html.includes('const HARD_WORDS'), 'inline HARD_WORDS should be gone');
});

test('generates the requested number of tokens for every mode length', () => {
  for (const n of [0, 10, 25, 50, 100, 200]) {
    assert.equal(makeWords(n).length, n);
    assert.equal(makeWords(n, { level: 'hard' }).length, n);
  }
});

test('easy: tokens are unmodified common words', () => {
  const words = makeWords(500, { level: 'easy' });
  for (const w of words) assert.ok(WORD_LIST.includes(w), 'not in WORD_LIST: ' + w);
});

test('easy: ignores capNext (no capitalization at any level of chance)', () => {
  const words = makeWords(200, { level: 'easy', capNext: true });
  for (const w of words) assert.match(w, /^[a-z]/);
});

test('medium: capitalizes the first word by default', () => {
  // rng: word pick (0 -> "time"), punctuation roll (0.5 -> none)
  const [w] = makeWords(1, { level: 'medium', rng: scriptedRng([0, 0.5]) });
  assert.equal(w, 'Time');
});

test('medium: capitalizes the word after a sentence ender', () => {
  // word "time" + r2 < 0.12 -> ender pick 0 -> "." then next word capitalized
  const rng = scriptedRng([0, 0.11, 0, /* next word: */ 0, 0.5]);
  const words = makeWords(2, { level: 'medium', capNext: false, rng });
  assert.deepEqual(words, ['time.', 'Time']);
});

test('medium: comma branch appends a comma without capitalizing later words', () => {
  const rng = scriptedRng([0, 0.15, /* next word: */ 0, 0.5]);
  const words = makeWords(2, { level: 'medium', capNext: false, rng });
  assert.deepEqual(words, ['time,', 'time']);
});

test('medium: never emits numbers or hard-list words', () => {
  const words = makeWords(500, { level: 'medium' });
  for (const w of words) {
    assert.match(w, /^[A-Za-z]+[.!?,]?$/, 'invalid medium token: ' + w);
    assert.ok(WORD_LIST.includes(w.replace(/[.!?,]$/, '').toLowerCase()), 'not a common word: ' + w);
  }
});

test('hard: number branch emits 3-4 digit numbers without punctuation', () => {
  // r < 0.07 -> number; second roll 0 -> 100
  assert.deepEqual(makeWords(1, { level: 'hard', rng: scriptedRng([0, 0]) }), ['100']);
  // second roll just under 1 -> 9099
  assert.deepEqual(makeWords(1, { level: 'hard', rng: scriptedRng([0, 0.99999]) }), ['9099']);
});

test('hard: draws from the hard list between the 7% and 55% thresholds', () => {
  // r = 0.1 -> hard word; pick 0 -> "achievement"; cap consumed; no suffix
  const [w] = makeWords(1, { level: 'hard', rng: scriptedRng([0.1, 0, 0.5]) });
  assert.equal(w, 'Achievement');
});

test('hard: suffix branch appends ; : or \'s', () => {
  const suffix = (pick) => makeWords(1, { level: 'hard', capNext: false, rng: scriptedRng([0.1, 0, 0.25, pick]) })[0];
  assert.equal(suffix(0), 'achievement;');
  assert.equal(suffix(0.5), 'achievement:');
  assert.equal(suffix(0.99), "achievement's");
});

test('hard: every generated token is a valid typing target', () => {
  const words = makeWords(1000, { level: 'hard' });
  for (const w of words) {
    assert.match(w, /^(?:[A-Za-z]+(?:[.!?,;:]|'s)?|\d{3,4})$/, 'invalid hard token: ' + w);
  }
});

test('rng at the top of its range keeps list indices in bounds', () => {
  const atTop = () => 0.9999999;
  assert.equal(makeWords(5, { level: 'easy', rng: atTop })[0], WORD_LIST[WORD_LIST.length - 1]);
  const hard = makeWords(5, { level: 'hard', rng: atTop });
  for (const w of hard) assert.ok(w.length > 0);
});

test('same rng sequence produces identical output', () => {
  let seed = 42;
  const lcg = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const a = makeWords(50, { level: 'hard', rng: lcg });
  seed = 42;
  const b = makeWords(50, { level: 'hard', rng: lcg });
  assert.deepEqual(a, b);
});
