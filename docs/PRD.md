# Cadence PRD

## Problem Statement

Typing-test sites are usually split between sterile utility interfaces and playful experiences that are too shallow to trust. Cadence should become a public, web-based typing test that feels visually distinctive, works on desktop and mobile, and reports speed using recognizable typing-test conventions.

The current project is a published static export of the arcade-style Cadence concept. It proves the visual direction, but it still depends on runtime-loaded CDN scripts and an exported component runtime. Before Cadence can be treated as a serious public project, it needs a reliable production surface, clearer product scope, a stable scoring model, mobile QA, and a path to future competitive or training features.

## Solution

Build Cadence v1 as a polished static typing-test platform using the exact arcade/LED visual identity from the uploaded design as the product baseline. The v1 release should preserve the current design language while hardening the implementation for public use: local runtime assets, reliable boot, mobile-friendly typing, standards-based WPM/accuracy reporting, and a simple publishing setup.

The product should prioritize a high-quality single-player typing test first. It should feel premium and memorable, but the scoring must remain transparent and trustworthy.

## User Stories

1. As a first-time visitor, I want the typing test to load quickly, so that I can start typing without setup.
2. As a first-time visitor, I want the visual design to feel distinctive, so that Cadence feels different from generic typing-test tools.
3. As a desktop user, I want to click or type to start the test, so that the interaction feels immediate.
4. As a mobile user, I want to tap the test area and use my phone keyboard, so that I can take a typing test on mobile.
5. As a user, I want the active word and caret to be obvious, so that I always know where I am typing.
6. As a user, I want correct characters, incorrect characters, missed characters, and extra characters to be visually distinct, so that I can understand mistakes while typing.
7. As a user, I want a timed mode, so that I can compare my score across standard durations.
8. As a user, I want a words mode, so that I can complete a fixed-size test without racing a timer.
9. As a user, I want difficulty levels, so that I can practice simple, medium, or harder word sets.
10. As a user, I want live WPM, accuracy, and progress counters, so that I can monitor my run while typing.
11. As a user, I want the counters to match the arcade LED design, so that the interface feels cohesive.
12. As a user, I want the test to finish automatically, so that I do not need to manually submit results.
13. As a user, I want a results screen with net WPM, raw WPM, accuracy, duration, and character breakdown, so that I can evaluate my performance.
14. As a user, I want WPM to follow the standard five-characters-per-word convention, so that the score is comparable to other typing platforms.
15. As a user, I want accuracy to be calculated from typed characters, so that mistakes affect my result clearly.
16. As a user, I want restart controls, so that I can quickly retry a test.
17. As a keyboard user, I want Escape to restart, so that repeated practice is fast.
18. As a keyboard user, I want Space to advance words, so that the test behaves like a normal typing test.
19. As a mobile user, I want the layout to avoid horizontal overflow, so that controls and typing text remain usable on narrow screens.
20. As a user on a slow or blocked network, I want the app to avoid CDN boot failures, so that the typing test still works.
21. As a project owner, I want the site to deploy from GitHub Pages or another static host, so that publishing is simple.
22. As a project owner, I want a clean README and metadata, so that the GitHub repository looks credible.
23. As a project owner, I want a screenshot or preview image, so that the repository and shared links communicate the product immediately.
24. As a project owner, I want a documented scoring model, so that future changes do not accidentally alter score semantics.
25. As a project owner, I want basic browser QA, so that regressions in typing, layout, and results are caught before sharing the project.
26. As a future contributor, I want the implementation to be understandable, so that the project can move beyond a generated export.
27. As a future contributor, I want isolated scoring logic, so that scoring can be tested without rendering the whole interface.
28. As a future contributor, I want isolated word generation logic, so that modes and difficulty can evolve safely.
29. As a future contributor, I want documented out-of-scope items, so that the first release does not expand into accounts, multiplayer, and analytics too early.
30. As a returning user, I want the project to keep its visual identity while improving reliability, so that the product does not lose the original design intent.

## Implementation Decisions

- Preserve the current arcade-style Cadence Marquee visual direction as the source of truth for v1.
- Keep v1 as a static web application that can be hosted without a backend.
- Replace or vendor external runtime dependencies so the app does not rely on CDN availability at boot.
- Treat the exported runtime as an initial implementation, not as the long-term architecture.
- Keep time and words modes in v1.
- Keep difficulty selection in v1.
- Defer account systems, cloud saves, leaderboards, and multiplayer until after the single-player test is stable.
- Define scoring as five typed characters per standard word.
- Report both raw WPM and net WPM.
- Track character categories as correct, incorrect, extra, and missed.
- Keep keyboard-first behavior for desktop users.
- Keep tap-to-focus behavior for mobile users.
- Use the existing public GitHub repository as the project home.
- Use GitHub Pages or equivalent static hosting for the first public deployment.
- Add project metadata for a public launch: title, description, preview image, favicon, and README content.
- Split the long-term implementation into deep modules: scoring, word generation, test state, input handling, rendering, persistence, and publishing configuration.
- Keep scoring and word generation independent from UI rendering so they can be tested directly.
- Avoid changing the visual identity while hardening the implementation.

## Testing Decisions

- Good tests should verify external behavior: given input text, target text, mode, and elapsed time, the app should produce the expected score and result state.
- Scoring tests should cover perfect runs, wrong characters, extra characters, missed characters, backspacing, empty input, very short elapsed time, and final-word behavior.
- Word generation tests should cover easy, medium, and hard modes, including punctuation and numeric cases when enabled.
- Test-state tests should cover idle, running, finished, restart, timed completion, and fixed-word completion.
- Input tests should cover Space advancing to the next word, Escape restarting, paste prevention if retained, and mobile text input behavior.
- Layout QA should cover desktop, tablet, and mobile widths.
- Publishing QA should verify the deployed URL loads from a clean browser session.
- Runtime QA should verify the app still boots when CDN access is unavailable after dependencies are vendored.
- Visual QA should compare the public implementation against the arcade/LED design baseline.

## Out of Scope

- User accounts.
- Cloud history.
- Global leaderboards.
- Multiplayer races.
- Payments or subscriptions.
- Admin dashboards.
- Server-side analytics.
- Custom text uploads.
- Full internationalization.
- Native mobile apps.
- Replacing the entire design direction.
- Building a complete Monkeytype-style customization system in v1.

## Further Notes

- This PRD assumes Cadence v1 means “make the current public arcade export reliable, publishable, and testable.”
- The current repository is public at `parzival92/cadence`.
- The current exported runtime loads third-party scripts at runtime; removing that dependency is a high-priority launch hardening task.
- The exact design source should remain respected unless a later PRD explicitly changes the visual direction.
- Open decision: whether to keep the generated runtime for v1 or rebuild the same interface as hand-owned HTML, CSS, and JavaScript.
- Open decision: whether GitHub Pages is the preferred first host or whether another static host should be used.
- Open decision: whether v1 should include local personal-best persistence.
- Open decision: whether quote mode should be part of v1 or deferred.
