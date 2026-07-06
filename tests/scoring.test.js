// Run with: node --test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { compareWord, computeLiveWpm, scoreTest } = require('../src/scoring.js');

test('compareWord: exact match is all correct', () => {
  assert.deepEqual(compareWord('hello', 'hello'), { correct: 5, incorrect: 0, extra: 0, missed: 0 });
});

test('compareWord: wrong characters count as incorrect', () => {
  assert.deepEqual(compareWord('hello', 'hxllo'), { correct: 4, incorrect: 1, extra: 0, missed: 0 });
});

test('compareWord: typing past the target counts as extra', () => {
  assert.deepEqual(compareWord('hi', 'hiya'), { correct: 2, incorrect: 0, extra: 2, missed: 0 });
});

test('compareWord: stopping short counts as missed', () => {
  assert.deepEqual(compareWord('hello', 'he'), { correct: 2, incorrect: 0, extra: 0, missed: 3 });
});

test('compareWord: empty typed word is all missed', () => {
  assert.deepEqual(compareWord('word', ''), { correct: 0, incorrect: 0, extra: 0, missed: 4 });
});

test('compareWord: case matters', () => {
  assert.deepEqual(compareWord('Hello', 'hello'), { correct: 4, incorrect: 1, extra: 0, missed: 0 });
});

test('computeLiveWpm: five chars per word convention', () => {
  // 50 correct chars in 60s = 10 words in 1 minute
  assert.equal(computeLiveWpm(50, 60), 10);
});

test('computeLiveWpm: clamps elapsed time to one second', () => {
  // At 0s elapsed the minute floor (1/60) applies: 5 chars -> 1 word / (1/60 min) = 60
  assert.equal(computeLiveWpm(5, 0), 60);
});

test('computeLiveWpm: zero chars is zero', () => {
  assert.equal(computeLiveWpm(0, 30), 0);
});

test('scoreTest: perfect run', () => {
  // 25 correct chars in 30s -> raw = net = round((25/5) / 0.5) = 10
  const words = [
    { target: 'quick', typed: 'quick' },
    { target: 'brown', typed: 'brown' },
    { target: 'foxes', typed: 'foxes' },
    { target: 'jumps', typed: 'jumps' },
    { target: 'ledge', typed: 'ledge' },
  ];
  const s = scoreTest(words, 30);
  assert.equal(s.wpm, 10);
  assert.equal(s.rawWpm, 10);
  assert.equal(s.accuracy, 100);
  assert.equal(s.correctChars, 25);
  assert.equal(s.incorrectChars, 0);
  assert.equal(s.extraChars, 0);
  assert.equal(s.missedChars, 0);
  assert.equal(s.time, 30);
});

test('scoreTest: incorrect characters lower net WPM but not raw WPM', () => {
  // 20 correct + 5 incorrect in 60s: raw = round(25/5) = 5, net = round(20/5) = 4
  const words = [
    { target: 'aaaaa', typed: 'aaaaa' },
    { target: 'bbbbb', typed: 'bbbbb' },
    { target: 'ccccc', typed: 'ccccc' },
    { target: 'ddddd', typed: 'ddddd' },
    { target: 'eeeee', typed: 'xxxxx' },
  ];
  const s = scoreTest(words, 60);
  assert.equal(s.rawWpm, 5);
  assert.equal(s.wpm, 4);
  assert.equal(s.accuracy, 80); // 20 / 25
  assert.equal(s.incorrectChars, 5);
});

test('scoreTest: extra characters count against accuracy and raw WPM', () => {
  // "hi" typed "hiya": 2 correct + 2 extra
  const s = scoreTest([{ target: 'hi', typed: 'hiya' }], 60);
  assert.equal(s.correctChars, 2);
  assert.equal(s.extraChars, 2);
  assert.equal(s.accuracy, 50); // 2 / (2 + 0 + 2)
  assert.equal(s.rawWpm, 1);    // round(4/5) = 1
  assert.equal(s.wpm, 0);       // round(2/5) = 0
});

test('scoreTest: missed characters are tracked but do not affect accuracy', () => {
  // accuracy divides by typed chars only (correct + incorrect + extra)
  const s = scoreTest([{ target: 'hello', typed: 'he' }], 60);
  assert.equal(s.correctChars, 2);
  assert.equal(s.missedChars, 3);
  assert.equal(s.accuracy, 100); // 2 / 2 typed chars were correct
});

test('scoreTest: empty input scores zero with 100% accuracy', () => {
  const s = scoreTest([], 30);
  assert.equal(s.wpm, 0);
  assert.equal(s.rawWpm, 0);
  assert.equal(s.accuracy, 100);
  assert.equal(s.correctChars + s.incorrectChars + s.extraChars + s.missedChars, 0);
});

test('scoreTest: short elapsed times clamp to one second', () => {
  // 5 correct chars at 0.2s -> clamped to 1s -> round((5/5) / (1/60)) = 60
  const s = scoreTest([{ target: 'quick', typed: 'quick' }], 0.2);
  assert.equal(s.wpm, 60);
  assert.equal(s.time, 1);
});

test('scoreTest: mixed run matches the char-by-char breakdown', () => {
  const words = [
    { target: 'time', typed: 'time' },     // 4 correct
    { target: 'people', typed: 'peXple' }, // 5 correct, 1 incorrect
    { target: 'year', typed: 'yearly' },   // 4 correct, 2 extra
    { target: 'way', typed: 'w' },         // 1 correct, 2 missed
  ];
  const s = scoreTest(words, 60);
  assert.equal(s.correctChars, 14);
  assert.equal(s.incorrectChars, 1);
  assert.equal(s.extraChars, 2);
  assert.equal(s.missedChars, 2);
  assert.equal(s.rawWpm, 3);       // round(17/5)
  assert.equal(s.wpm, 3);          // round(14/5)
  assert.equal(s.accuracy, 82);    // round(14/17 * 100)
});
