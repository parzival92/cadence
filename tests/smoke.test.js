'use strict';

// Launch smoke checks: verify the static page is wired correctly and the
// vendored runtime matches what support.js pins, so a broken boot or a
// stale vendor file fails `node --test` before it ships.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const html = read('index.html');
const support = read('support.js');

function sha384(p) {
  const buf = fs.readFileSync(path.join(root, p));
  return 'sha384-' + crypto.createHash('sha384').update(buf).digest('base64');
}

test('vendored React matches the SRI hash pinned in support.js', () => {
  const pinned = /REACT_SRI = "([^"]+)"/.exec(support);
  assert.ok(pinned, 'support.js should pin REACT_SRI');
  assert.strictEqual(sha384('vendor/react.production.min.js'), pinned[1]);
});

test('vendored ReactDOM matches the SRI hash pinned in support.js', () => {
  const pinned = /REACT_DOM_SRI = "([^"]+)"/.exec(support);
  assert.ok(pinned, 'support.js should pin REACT_DOM_SRI');
  assert.strictEqual(sha384('vendor/react-dom.production.min.js'), pinned[1]);
});

test('vendored React loads before support.js so the CDN fallback is skipped', () => {
  const scripts = [...html.matchAll(/<script src="\.\/([^"]+)"/g)].map((m) => m[1]);
  const order = ['vendor/react.production.min.js', 'vendor/react-dom.production.min.js', 'support.js']
    .map((f) => scripts.indexOf(f));
  assert.ok(order.every((i) => i >= 0), 'all runtime scripts should be referenced');
  assert.deepStrictEqual(order, [...order].sort((a, b) => a - b));
});

test('every local file referenced by index.html exists', () => {
  const refs = [...html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length >= 8, `expected several local references, found ${refs.length}`);
  for (const ref of refs) {
    assert.ok(fs.existsSync(path.join(root, ref)), `missing referenced file: ${ref}`);
  }
});

test('social preview URLs point at files that exist in the repo', () => {
  const urls = [...html.matchAll(/content="https:\/\/parzival92\.github\.io\/cadence\/([^"]+)"/g)]
    .map((m) => m[1])
    .filter((p) => p.includes('.'));
  assert.ok(urls.length >= 1, 'expected at least the og:image URL');
  for (const rel of urls) {
    assert.ok(fs.existsSync(path.join(root, rel)), `missing preview asset: ${rel}`);
  }
});

test('launch metadata is present in the static head', () => {
  const head = html.slice(0, html.indexOf('<body'));
  for (const needle of [
    '<title>',
    'name="description"',
    'property="og:image"',
    'name="twitter:card"',
    'rel="icon"',
  ]) {
    assert.ok(head.includes(needle), `head should contain ${needle}`);
  }
});

test('scoring, words, and personal-best modules load and expose their APIs', () => {
  const scoring = require('../src/scoring.js');
  const words = require('../src/words.js');
  const pb = require('../src/personalbest.js');
  assert.strictEqual(typeof scoring.scoreTest, 'function');
  assert.strictEqual(typeof scoring.computeLiveWpm, 'function');
  assert.strictEqual(typeof words.makeWords, 'function');
  assert.strictEqual(typeof pb.record, 'function');
});
