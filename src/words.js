// Cadence word generation and difficulty rules. Loadable as a browser
// global (window.CadenceWords) or a CommonJS module for tests. Mirrors the
// generation rules used by the UI in index.html; pass an `rng` to make the
// output deterministic.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CadenceWords = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const WORD_LIST = ["time","people","year","way","day","man","thing","woman","life","child","world","school","state","family","student","group","country","problem","hand","part","place","case","week","company","system","program","question","work","government","number","night","point","home","water","room","mother","area","money","story","fact","month","lot","right","study","book","eye","job","word","business","issue","side","kind","head","house","service","friend","father","power","hour","game","line","end","member","law","car","city","community","name","president","team","minute","idea","body","information","back","parent","face","others","level","office","door","health","person","art","war","history","party","result","change","morning","reason","research","girl","guy","moment","air","teacher","force","education","order","ability","able","about","above","accept","across","act","action","actually","address","admit","adult","affect","after","again","against","age","agency","agree","allow","almost","alone","along","already","also","although","always","among","amount","analysis","animal","another","answer","any","anyone","anything","appear","apply","approach","argue","around","arrive","article","artist","assume","attack","attention","attorney","audience","author","available","avoid","away","baby","bad","bag","ball","bank","bar","base","beautiful","because","become","bed","before","begin","behavior","behind","believe","benefit","best","better","between","beyond","big","bill","billion","bit","black","blood","blue","board","born","both","box","boy","break","bring","brother","budget","build","building","but"];

  const HARD_WORDS = ["achievement","acknowledge","administration","algorithm","alternative","apparatus","appreciate","architecture","atmosphere","authority","bureaucracy","catastrophe","characteristic","circumstance","colleague","combination","communication","competition","comprehensive","consequence","conspiracy","constitution","contemporary","controversy","curriculum","development","discipline","distinguish","efficiency","electricity","emphasize","enthusiasm","environment","equilibrium","examination","exceptional","experience","explanation","extraordinary","frequency","fundamental","hypothesis","imagination","immediately","independence","individual","infrastructure","intelligence","interpretation","investigation","knowledge","laboratory","legislation","literature","maintenance","manufacture","mathematics","mechanism","necessary","negotiation","neighborhood","nevertheless","occasionally","opportunity","organization","parliament","performance","phenomenon","philosophy","photograph","physician","possession","preparation","professional","psychology","publication","qualification","questionnaire","recommendation","relationship","representative","requirement","responsibility","restaurant","revolutionary","significance","simultaneously","sophisticated","spontaneous","statistics","strategy","substantial","sufficient","surveillance","technique","technology","temperature","theoretical","throughout","traditional","transportation","tremendous","understanding","unfortunately","university","vocabulary"];

  // Generate n typing-test tokens.
  //
  // options:
  //   level    'easy' | 'medium' | 'hard' (default 'easy')
  //            easy   — common words only, no capitalization or punctuation
  //            medium — common words; sentence capitalization, . ! ? ,
  //            hard   — mixes in hard words and 3-4 digit numbers; adds ; : 's
  //   capNext  capitalize the first eligible word (default: level !== 'easy',
  //            matching how the UI starts a fresh test)
  //   rng      () => [0, 1) random source (default Math.random)
  function makeWords(n, options) {
    const opts = options || {};
    const level = opts.level || 'easy';
    const rng = opts.rng || Math.random;
    let capNext = 'capNext' in opts ? !!opts.capNext : level !== 'easy';
    const arr = [];
    for (let i = 0; i < n; i++) {
      let w;
      if (level === 'hard') {
        const r = rng();
        if (r < 0.07) w = String(Math.floor(rng() * 9000) + 100);
        else if (r < 0.55) w = HARD_WORDS[Math.floor(rng() * HARD_WORDS.length)];
        else w = WORD_LIST[Math.floor(rng() * WORD_LIST.length)];
      } else {
        w = WORD_LIST[Math.floor(rng() * WORD_LIST.length)];
      }
      if (level !== 'easy' && /^[a-z]/.test(w)) {
        if (capNext) { w = w[0].toUpperCase() + w.slice(1); capNext = false; }
        const r2 = rng();
        if (r2 < 0.12) { w += ['.', '!', '?'][Math.floor(rng() * 3)]; capNext = true; }
        else if (r2 < 0.22) { w += ','; }
        else if (level === 'hard' && r2 < 0.28) { w += [';', ':', "'s"][Math.floor(rng() * 3)]; }
      }
      arr.push(w);
    }
    return arr;
  }

  return { WORD_LIST, HARD_WORDS, makeWords };
});
