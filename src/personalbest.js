// Cadence local personal-best tracking. Loadable as a browser global
// (window.CadencePB) or a CommonJS module for tests. Bests are stored in
// one localStorage entry, keyed per test configuration (mode + duration or
// word count + difficulty). Local only — no accounts, no network.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CadencePB = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'cadence.pb.v1';

  function configKey(cfg) {
    return cfg.mode + ':' + cfg.option + ':' + cfg.level;
  }

  // All storage access is defensive: localStorage can be unavailable
  // (private browsing, blocked cookies) or hold corrupted JSON, and a
  // typing test must never crash over a high score.
  function loadAll(storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function getBest(storage, cfg) {
    const entry = loadAll(storage)[configKey(cfg)];
    return entry && typeof entry.wpm === 'number' ? entry : null;
  }

  // Record a finished run. Returns { best, isNew }: `best` is the stored
  // entry for this configuration after the call, `isNew` is true when this
  // run set it. Zero-WPM runs never count, and ties keep the older entry.
  function record(storage, cfg, result) {
    const prev = getBest(storage, cfg);
    if (!(result.wpm > 0)) return { best: prev, isNew: false };
    if (prev && result.wpm <= prev.wpm) return { best: prev, isNew: false };
    const entry = { wpm: result.wpm, accuracy: result.accuracy, at: result.at || new Date().toISOString() };
    try {
      const all = loadAll(storage);
      all[configKey(cfg)] = entry;
      storage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      return { best: prev, isNew: false };
    }
    return { best: entry, isNew: true };
  }

  return { STORAGE_KEY, configKey, getBest, record };
});
