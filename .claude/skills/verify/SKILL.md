---
name: verify
description: Build/launch/drive recipe for verifying Cadence changes at the browser surface.
---

# Verifying Cadence

Cadence is a static site — no build step. The surface is the browser page.

## Launch

```bash
python3 -m http.server 8571 --bind 127.0.0.1   # from the repo root, background it
```

## Drive (headless, no Chrome-extension dependency)

`npm i puppeteer-core` in a scratch dir and launch the installed Chrome:

```js
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});
```

Gotchas learned the hard way:

- The x-dc template hydrates after first paint: static text ("CADENCE", "RESTART")
  appears before `{{ }}` interpolations (pill values, status label). Wait for an
  interpolated string (e.g. `waitForFunction` on a dynamic label), not "CADENCE".
- Don't require leaf `<div>`s when locating controls by text — interpolated text
  may sit in a wrapper element. Match any `div, span` by trimmed text and click
  the deepest match; the click bubbles to the handler.
- Typing: focus the hidden `<textarea>` and `page.type()` into it; a trailing
  space commits a word. Ten `'abc '` in 10-word WORDS mode reaches the results
  screen. Headless default `prefers-color-scheme` is **light**; use
  `page.emulateMediaFeatures` to test dark.

## Flows worth driving

- Idle screen renders (header pills, LED board, footer)
- Type a few words: live WPM/accuracy digits, error coloring, caret
- Finish a 10-word run: results screen, history bars, personal best
- Theme: OS-pref default, header LIGHT/DARK toggle, persistence in
  `localStorage['cadence.theme']`, `<meta name="theme-color">` sync
