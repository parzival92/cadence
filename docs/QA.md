# Launch QA

Repeatable checks to run before sharing a release. Two layers: automated
checks that must pass on every change, and a manual smoke checklist for the
flows only a real browser can verify.

## Automated checks

```bash
node --test
```

Runs the unit tests (scoring, word generation, personal bests) plus the
launch smoke tests in `tests/smoke.test.js`, which verify:

- the vendored React/ReactDOM files match the SRI hashes pinned in
  `support.js` (catches a stale or tampered `vendor/` after upgrades),
- `index.html` loads the vendored runtime before `support.js`, so the
  `unpkg.com` fallback is never used,
- every local file referenced by `index.html` exists (scripts, favicons,
  preview image),
- launch metadata (title, description, Open Graph, Twitter card) is present
  in the static head.

The same suite runs in CI on every push and pull request
(`.github/workflows/ci.yml`).

## Where to test

- **Local**: `open index.html`, or serve the repo root
  (`python3 -m http.server 8123`) and open `http://localhost:8123/`.
  Both must work — the app has no build step.
- **Deployed**: https://parzival92.github.io/cadence/ after the change
  lands on `main`. GitHub Pages can take a minute to update; confirm the
  change is actually live before checking.

Run the manual checklist locally before merging, and repeat the quick pass
(Boot + one full run) on the deployed URL after merging.

## Manual smoke checklist

### Boot and runtime

- [ ] Page loads with the arcade board rendered (LED digits, word lines,
      RESTART button); status reads STANDBY.
- [ ] DevTools console shows no errors on load or during a run.
- [ ] DevTools network tab shows no requests to `unpkg.com` (vendored
      runtime in use). The only external request is Google Fonts, and the
      app still works when it is blocked.
- [ ] Browser tab shows the LED "C" favicon and the title
      "Cadence — Arcade Typing Test".

### Modes and settings

- [ ] TIME and WORDS pills switch modes; the counter caption follows
      (seconds vs words).
- [ ] Durations 15 / 30 / 60 / 120 and word counts 10 / 25 / 50 / 100 are
      selectable and reset the test.
- [ ] EASY / MED / HARD switch difficulty and regenerate words (MED/HARD
      include capitalization or punctuation).
- [ ] Mode, length, and level cannot be changed mid-run.

### Desktop typing flow

- [ ] Clicking the test area (or pressing Tab) focuses it and clears the
      INSERT COIN overlay; clicking elsewhere restores the overlay.
- [ ] Typing starts the run: status flips to RECORDING, the header LED
      pulses, and the timer / word counter starts.
- [ ] The caret sits on the current character and advances as you type.
- [ ] Character states are visibly distinct: correct (dim), incorrect (red
      underline), extra typed chars (faded red), missed chars after
      committing a short word (dim red underline).
- [ ] Space commits the word and moves to the next; Space on an empty word
      does nothing.
- [ ] Live WPM and accuracy update during the run; accuracy turns red
      below 90%.
- [ ] Escape restarts: counters reset, fresh words, focus kept — including
      from the results screen.

### Completion and results

- [ ] Time mode ends by itself when the timer hits zero.
- [ ] Words mode ends by itself on committing the final word.
- [ ] Results show net WPM, accuracy, raw WPM, mode label, character
      breakdown (correct/incorrect/extra/missed), duration, and the WPM
      history bars.
- [ ] A better score shows ★ NEW PERSONAL BEST ★; a worse one shows the
      standing "personal best — N wpm" line (per mode + length + level,
      stored in localStorage).
- [ ] PLAY AGAIN starts a focused new run — typing works immediately
      without clicking the test area first.

### Mobile viewports

Open `qa-harness.html` (must be served over HTTP, not `file://`) to view
the app at 320 / 375 / 390 / 430 px, and test at least one real device or
DevTools device emulation for keyboard behavior:

- [ ] No horizontal overflow at any harness width; header controls wrap.
- [ ] Tapping the test area opens the keyboard and clears the overlay.
- [ ] Typing works with the on-screen keyboard; Space advances words.
- [ ] Autocorrect/swipe insertions do not corrupt the run (whole-word
      insertions are rejected; only single-char appends and deletes count).
- [ ] A full run completes and shows results at mobile width.

### Metadata and presentation (deployed only)

- [ ] The GitHub repository renders the README with the preview image.
- [ ] Pasting the live URL into a link-preview checker (or a chat app)
      shows the Cadence preview card, title, and description.
