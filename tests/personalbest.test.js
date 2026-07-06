// Run with: node --test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { STORAGE_KEY, configKey, getBest, record } = require('../src/personalbest.js');

const fakeStorage = (initial) => {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    dump: () => Object.fromEntries(map),
  };
};

const cfg = { mode: 'time', option: 30, level: 'easy' };

test('configKey combines mode, option, and level', () => {
  assert.equal(configKey(cfg), 'time:30:easy');
  assert.equal(configKey({ mode: 'words', option: 100, level: 'hard' }), 'words:100:hard');
});

test('first valid run becomes the personal best', () => {
  const s = fakeStorage();
  const r = record(s, cfg, { wpm: 42, accuracy: 96, at: '2026-07-06T12:00:00Z' });
  assert.equal(r.isNew, true);
  assert.equal(r.best.wpm, 42);
  assert.deepEqual(getBest(s, cfg), { wpm: 42, accuracy: 96, at: '2026-07-06T12:00:00Z' });
});

test('higher WPM replaces the best, lower or equal does not', () => {
  const s = fakeStorage();
  record(s, cfg, { wpm: 42, accuracy: 96 });
  assert.equal(record(s, cfg, { wpm: 41, accuracy: 100 }).isNew, false);
  assert.equal(record(s, cfg, { wpm: 42, accuracy: 100 }).isNew, false);
  assert.equal(getBest(s, cfg).accuracy, 96); // older entry kept on ties
  const r = record(s, cfg, { wpm: 43, accuracy: 90 });
  assert.equal(r.isNew, true);
  assert.equal(getBest(s, cfg).wpm, 43);
});

test('bests are isolated per configuration', () => {
  const s = fakeStorage();
  record(s, cfg, { wpm: 42, accuracy: 96 });
  record(s, { mode: 'time', option: 60, level: 'easy' }, { wpm: 30, accuracy: 90 });
  record(s, { mode: 'time', option: 30, level: 'hard' }, { wpm: 25, accuracy: 88 });
  assert.equal(getBest(s, cfg).wpm, 42);
  assert.equal(getBest(s, { mode: 'time', option: 60, level: 'easy' }).wpm, 30);
  assert.equal(getBest(s, { mode: 'time', option: 30, level: 'hard' }).wpm, 25);
  assert.equal(getBest(s, { mode: 'words', option: 30, level: 'easy' }), null);
});

test('zero-WPM runs are never recorded', () => {
  const s = fakeStorage();
  const r = record(s, cfg, { wpm: 0, accuracy: 100 });
  assert.equal(r.isNew, false);
  assert.equal(r.best, null);
  assert.equal(getBest(s, cfg), null);
});

test('corrupted stored JSON is treated as empty', () => {
  const s = fakeStorage({ [STORAGE_KEY]: '{not json' });
  assert.equal(getBest(s, cfg), null);
  const r = record(s, cfg, { wpm: 10, accuracy: 95 });
  assert.equal(r.isNew, true);
  assert.equal(getBest(s, cfg).wpm, 10);
});

test('non-object stored JSON is treated as empty', () => {
  for (const bad of ['[1,2]', '"str"', '42', 'null']) {
    const s = fakeStorage({ [STORAGE_KEY]: bad });
    assert.equal(getBest(s, cfg), null);
  }
});

test('malformed entries are ignored', () => {
  const s = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ 'time:30:easy': { wpm: 'high' } }) });
  assert.equal(getBest(s, cfg), null);
});

test('a throwing storage degrades to no PB instead of crashing', () => {
  const broken = {
    getItem: () => { throw new Error('denied'); },
    setItem: () => { throw new Error('denied'); },
  };
  assert.equal(getBest(broken, cfg), null);
  const r = record(broken, cfg, { wpm: 50, accuracy: 99 });
  assert.equal(r.isNew, false);
  assert.equal(r.best, null);
});

test('a storage that throws only on write reports the previous best', () => {
  const s = fakeStorage();
  record(s, cfg, { wpm: 42, accuracy: 96 });
  const readOnly = { getItem: s.getItem, setItem: () => { throw new Error('quota'); } };
  const r = record(readOnly, cfg, { wpm: 50, accuracy: 99 });
  assert.equal(r.isNew, false);
  assert.equal(r.best.wpm, 42);
});
