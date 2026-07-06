# Cadence

Cadence is an original arcade-style typing test app for measuring typing speed, accuracy, and consistency in the browser. It is built as a static web app, so it can run from a simple HTML file or any static hosting provider.

## Live App

https://parzival92.github.io/cadence/

## What It Does

Cadence gives users a focused typing test with real-time feedback and a results screen at the end of each run.

Core functionality:

- Timed typing tests
- Fixed-word typing tests
- Easy, medium, and hard difficulty levels
- Live WPM display
- Live accuracy display
- Progress counter
- Character-level feedback while typing
- Restart and replay flow
- Final result summary
- Raw WPM and net WPM
- Accuracy percentage
- Character breakdown
- Desktop keyboard support
- Mobile tap-to-type support
- Static-site deployment support

## Scoring

Cadence uses the standard typing-test convention where one word equals five characters.

- **Raw WPM** measures total typed characters per minute.
- **Net WPM** measures speed after accounting for typing errors.
- **Accuracy** measures correct typed characters as a percentage of typed characters.
- **Character breakdown** separates correct, incorrect, extra, and missed characters.

This makes results easy to compare across different test lengths and modes.

## Controls

- Start typing: click or tap the test area, then type
- Next word: `Space`
- Restart: `Esc`
- Change mode: select `TIME` or `WORDS`
- Change duration: select `15`, `30`, `60`, or `120`
- Change difficulty: select `EASY`, `MED`, or `HARD`

## Run Locally

Open `index.html` in a browser.

```bash
open index.html
```

No build step is required.

## Run Tests

Scoring rules live in `src/scoring.js` and are covered by unit tests. With Node.js 18+ installed:

```bash
node --test
```

No test dependencies are required; the suite uses Node's built-in test runner.

## Deploy

Cadence is a static site. It can be deployed from the repository root.

Supported deployment targets include:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any static file server

For GitHub Pages, publish the `main` branch from the repository root.

## Project Structure

```text
.
├── index.html
├── support.js
├── src/
│   └── scoring.js
├── tests/
│   └── scoring.test.js
├── uploads/
│   └── pasted-1783285593538-0.png
├── docs/
│   └── PRD.md
├── .nojekyll
├── .gitignore
└── README.md
```

## Technical Notes

- The app currently ships as a static browser app.
- The UI and interaction logic are contained in `index.html`.
- Runtime support code is contained in `support.js`.
- Scoring rules are isolated in `src/scoring.js` (browser global `CadenceScoring`, CommonJS for tests). The UI in `index.html` still carries its own copy of these rules; wiring it to the module is tracked separately.
- `.nojekyll` is included so GitHub Pages serves all static files directly.
- The current runtime loads React, ReactDOM, and Babel from `unpkg.com`.

## Product Direction

The immediate goal is to make Cadence a reliable public typing-test app with a polished single-player experience.

Planned improvements:

- Vendor runtime dependencies locally
- Add a live deployment URL
- Add browser QA coverage
- Add a project preview image
- Improve README screenshots and metadata
- Extract word generation into a testable module
- Add local personal-best tracking
- Add stronger mobile QA

## Documentation

The product requirements document is available at:

[docs/PRD.md](docs/PRD.md)

## License

No license has been selected yet.
