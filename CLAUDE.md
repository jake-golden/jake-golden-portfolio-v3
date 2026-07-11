# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project Overview

Clean rebuild of Jake Golden's engineering portfolio (`jake-golden.github.io`). This is **Phase 1: code cleanup only** — visual parity with the live site, except reused UI elements (carousel, skill-card, lightbox, project card, banner) get visually unified since their current per-page inconsistency is a bug being fixed. A full visual redesign is a deliberate, separate later phase — do not get ahead of scope.

Full plan: `/Users/jakegolden/.claude/plans/i-d-always-like-to-adaptive-lake.md` (on the machine this was planned on — read it for complete context/rationale if present).

**Do not modify anything in `/Users/jakegolden/jake-golden.github.io/`** (the live site) or treat `/Users/jakegolden/jake-golden-portfolio-v2/` as a resource — v2 was an earlier, abandoned attempt at this same redesign (uncommitted, no remote, different architecture using Web Components/Shadow DOM/Motion One). It was deliberately superseded by this repo (v3) using a simpler plain-JS approach. Don't pull code from it.

## Architecture

**No build step.** Plain HTML/CSS/JS only — every file is exactly what ships.

**Core pattern**: placeholder-`<div>` injection (the trick `navbar.js`/`footer.js` already use) extended to every repeated piece — project banner, lightbox, carousel — instead of copy-pasting markup per page:

```html
<body data-project="pulse-oximeter">
  <div id="navbar-placeholder"></div><script src="js/navbar.js"></script>
  <div id="banner-placeholder"></div><script src="js/project-banner.js"></script>
  <!-- unique per-page content -->
  <div id="footer-placeholder"></div><script src="js/footer.js"></script>
  <script src="js/lightbox.js"></script>
  <script src="js/carousel.js"></script>
  <script src="js/scripts.js"></script>
</body>
```

**`js/projects-data.js`** is the single source of truth for project metadata (slug, title, tags, thumbnail, banner image, description). Consumed by `engineering.html` (grid), `navbar.js` (nav highlighting — this structurally fixes the sync bug the live site has), and `project-banner.js` (per-page banner).

**JS modules**: `head.js`/`navbar.js`/`footer.js` (carried over), `projects-data.js` (new), `project-banner.js` (new), `lightbox.js` (new, one implementation replacing 5 copy-pasted versions, image+video), `carousel.js` (new, the custom carousel promoted out of `scripts.js`, replacing Bootstrap's carousel everywhere — avoid third-party black boxes where practical), `gallery-thumbs.js`/`gallery-thumbs-check.js` (carried over), `scripts.js` (slimmed to scroll-progress bar, typing animation, FLIP filter for engineering.html).

**CSS**: split into `css/base.css` (resets, typography, Bootstrap var overrides, one shared breakpoint set) and `css/components.css` (unified card primitive, skill-card, carousel, lightbox, banner, nav, footer). Prefer fluid layout (CSS Grid `auto-fit`/`minmax()`, Flexbox wrap, `clamp()`) over hardcoded per-component breakpoints; explicit media queries only for genuine structural shifts (nav → hamburger).

**Math rendering**: KaTeX only (not MathJax — MathJax was loaded via `polyfill.io`, a service caught injecting malware in 2024; dropped entirely).

**Images**: `.webp` + one fallback format (`.jpg`/`.png`) per image is intentional, not redundant — webp loads first (faster/cheaper), fallback serves unsupported browsers. Don't collapse to a single format.

**`emerson.html` is excluded** from this migration (content-less stub, no source folder even exists for it on the live site).

## Local Dev

`python3 -m http.server 8082` from repo root (config also lives in the *other* repo's `.claude/launch.json` as `portfolio-v3`, since Claude Code's preview tool reads launch configs from its primary working directory — add an equivalent entry there if working from this repo directly instead).

## Git Workflow (project-specific override)

Unlike the general preference to never commit without being asked, **for this project commit and push after each validated step** — GitHub Pages only builds from pushed commits, and the whole point of this rebuild is small prototype → deploy → validate cycles against the live GitHub Pages preview at `jake-golden.github.io/jake-golden-portfolio-v3/`. Confirmed explicitly with the user.

## Migration Status

See TaskList in the active session, or the plan file, for the 7-step rollout order. Update this section as phases complete if picking this up in a new session.
