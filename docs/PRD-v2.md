# Cadence v2 PRD (Draft)

Status: **draft for review** — priorities and scope below are proposals, not
commitments. v1 shipped on 2026-07-07 (see issue #1 for the launch summary);
this document collects the post-v1 direction.

## Problem Statement

Cadence v1 is a reliable, distinctive single-player typing test. What it does
not yet do is give players a reason to return beyond beating a number: there
is one content source (generated word lists), results disappear into a single
personal-best figure, and a strong run cannot be shown to anyone.

v2 should deepen the single-player loop — more to type, more to learn from a
run, and something to share — without compromising what made v1 trustworthy:
no accounts, no network dependence, transparent scoring, and the arcade LED
identity.

## Principles (carried over from v1)

- **Local-first**: everything works offline from static files; no accounts,
  no server, no telemetry. Player data stays in the browser.
- **Transparent scoring**: the v1 scoring model (5-chars-per-word, net/raw
  WPM, typed-character accuracy) is frozen; new features report through it,
  never alongside a competing model.
- **Identity is load-bearing**: new surfaces reuse the LED dot-matrix design
  language rather than introducing new visual systems.

## Proposed Features (priority order)

### 1. Quote mode (committed — deferred from v1 in #11)

Type real passages instead of generated words.

- A QUOTE pill beside TIME and WORDS; short/medium/long length filter in the
  option row.
- Curated public-domain quote set bundled locally (no network fetch), stored
  in a `src/quotes.js` module with tests for length bands and character
  hygiene (no smart quotes or characters the test cannot render).
- Same scoring, results, and personal-best flow; the run finishes on the
  last committed word. Personal bests keyed per length band.
- No custom text uploads (unchanged from #11's guardrails).

### 2. Run insights on the results screen

Turn the data a run already produces into something a player learns from.

- Consistency: the WPM history the results bars already show, summarized as
  a steadiness figure so players can see flow vs burst typing.
- Problem characters: the per-character comparison already computed during
  scoring, aggregated into "slowest/most-missed keys" for the run.
- Stored locally alongside personal bests; no new data collection.

### 3. Shareable result card

A strong run should be showable.

- A "SHARE" control on the results screen that renders the run as an
  arcade-styled score-card image (same LED rendering as the social preview
  asset) via a client-side canvas — downloadable and share-sheet friendly.
- Contains only the run's stats; nothing identifies the player.

### 4. Installable app (PWA)

The app is already offline-capable; make that a feature.

- Web app manifest (icons exist from v1) and a minimal service worker so
  Cadence installs to a home screen or dock and launches offline.
- No background sync, no push notifications.

## Out of Scope (unchanged from v1)

User accounts, cloud history, global leaderboards, multiplayer races,
payments, admin dashboards, server-side analytics, custom text uploads, full
internationalization, native mobile apps, replacing the design direction,
and a full customization system.

## Open Questions

- Quote sourcing: hand-curate (~50–100 quotes) or derive from a vetted
  public-domain corpus? Curation quality is the feature.
- Should insights (feature 2) accumulate across runs into a local practice
  profile, or stay per-run? Cross-run history increases value and
  localStorage complexity.
- Is the PWA worth a service worker's cache-invalidation risk on GitHub
  Pages, or is installability alone (manifest only) enough for a first cut?
