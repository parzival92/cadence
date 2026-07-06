// Cadence scoring rules. Loadable as a browser global (window.CadenceScoring)
// or a CommonJS module for tests. Mirrors the conventions used by the UI in
// index.html: one word = five characters, elapsed time clamped to >= 1s.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CadenceScoring = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Character-level comparison of one target word against what was typed.
  function compareWord(target, typed) {
    const len = Math.max(target.length, typed.length);
    let correct = 0, incorrect = 0, extra = 0, missed = 0;
    for (let i = 0; i < len; i++) {
      if (i < target.length && i < typed.length) {
        if (target[i] === typed[i]) correct++; else incorrect++;
      } else if (i >= target.length) {
        extra++;
      } else {
        missed++;
      }
    }
    return { correct, incorrect, extra, missed };
  }

  // Live WPM shown while a test runs. Clamps to a one-second minimum so the
  // first ticks don't divide by ~zero.
  function computeLiveWpm(correctChars, elapsedSec) {
    const minutes = Math.max(elapsedSec / 60, 1 / 60);
    return Math.max(0, Math.round((correctChars / 5) / minutes));
  }

  // Final score for a finished test. `words` is an array of
  // { target, typed } pairs: every committed word, plus the in-progress word
  // if the test ended mid-word with input present.
  function scoreTest(words, elapsedSecRaw) {
    const elapsedSec = Math.max(elapsedSecRaw, 1);
    let correct = 0, incorrect = 0, extra = 0, missed = 0;
    words.forEach(w => {
      const cmp = compareWord(w.target, w.typed);
      correct += cmp.correct;
      incorrect += cmp.incorrect;
      extra += cmp.extra;
      missed += cmp.missed;
    });
    const minutes = elapsedSec / 60;
    const rawChars = correct + incorrect + extra;
    const rawWpm = Math.max(0, Math.round((rawChars / 5) / minutes));
    const netWpm = Math.max(0, Math.round((correct / 5) / minutes));
    const totalForAcc = correct + incorrect + extra;
    const accuracy = totalForAcc > 0 ? Math.round((correct / totalForAcc) * 100) : 100;
    return {
      wpm: netWpm,
      rawWpm,
      accuracy,
      correctChars: correct,
      incorrectChars: incorrect,
      extraChars: extra,
      missedChars: missed,
      time: Math.round(elapsedSec),
    };
  }

  return { compareWord, computeLiveWpm, scoreTest };
});
