# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project Overview

Clean rebuild of Jake Golden's engineering portfolio (old version is `jake-golden-portfolio-legacy`). This is **Phase 1: code cleanup only** — visual parity with the live site, except reused UI elements (carousel, skill-card, lightbox, project card, banner) get visually unified since their current per-page inconsistency was a bug the user wanted fixed. A full visual redesign is a deliberate, separate later phase — do not get ahead of scope.

Full plan: `/Users/jakegolden/.claude/plans/i-d-always-like-to-adaptive-lake.md` (on the machine this was planned on — read it for full original rationale if present; note the plan predates some decisions below, which supersede it where they conflict).

**Do not modify anything in `/Users/jakegolden/jake-golden-portfolio-legacy`** (the live site — untouched until a deliberate future cutover) or treat `/Users/jakegolden/jake-golden-portfolio-v2/` as a resource — v2 was an earlier, abandoned attempt at this same redesign (uncommitted, no remote, different architecture using Web Components/Shadow DOM/Motion One). The user explicitly chose to ignore it and start fresh as v3. Don't pull code from it.

## Migration Status: all 13 pages done, all 7 tasks complete

**Done** (tasks 1-7): scaffold, `projects-data.js` + data-driven engineering grid, shared banner/lightbox/carousel components, all 9 project pages (pulse-oximeter, stryker, steel-ball-dispenser, sims-pump, self-balancing-robot, stevens, pacemaker, cpu, bsel-projects), index/photography/resume/contact, CSS cleanup pass, and final QA pass. Every page is live and verified at `jake-golden-portfolio-legacy/jake-golden-portfolio-v3/`. `emerson.html` is deliberately excluded (content-less stub, no source assets exist for it).

**Task 6 — CSS cleanup pass**: deleted ~189 lines of dead CSS (the Start-Bootstrap `.profile`/`.profile-img`/`.dots-1`–`.dots-4` block, `.process-pane`, `.section-content`, two dead `.expandable-card` sub-rules, a shadowed duplicate `.content-box`) plus the paired dead JS (`scripts.js`'s "Section Toggles" block, which only ever targeted the now-nonexistent `.banner`/`data-target` pattern). Merged the two conflicting `.project-card` definitions in `styles.css` (one had silently been dead-cascading over the other, including a mobile breakpoint that never actually applied) into one canonical rule with a working `@media (max-width: 991px)` step. Removed page-local `<style>` blocks on 4 pages that verbatim-redeclared `.content-box`/`.skill-item` instead of relying on the shared rule.

**Scope decisions made** (both deliberately conservative, confirmed with the user):
- **Did not** do the full BEM card-primitive consolidation (`.content-box`/`.skill-item`/`.skill-card`/`.expandable-card` → one `.card` + modifiers) originally planned for Task 6. `.expandable-card` already composes with Bootstrap's own `.card` class and has JS coupling in `scripts.js` — renaming it was judged too much regression risk for the benefit. The 6 pages with a legitimate `margin-bottom` delta override on `.content-box` were left as-is (not treated as duplication).
- **Did not** enrich the 3 thin meta descriptions (contact/resume/photography) or add Open Graph tags — nothing was actually broken there, just less rich than the project pages' descriptions; left out of scope.

**Task 7 — Final QA pass**: console-error sweep (clean on all 13 pages), internal link check (audit found zero broken links/casing mismatches), meta tag audit (see scope decision above), `?checkThumbs=1` on photography (all 41 photos have complete thumbnail sets), and a full mobile/responsive sweep. Found and fixed real bugs beyond the original audit:
- `self-balancing-robot.html` and `steel-ball-dispenser.html` were missing the `<script src="js/lightbox.js">` include — carousel images showed a `zoom-in` cursor but clicking did nothing. Added the script tag (matches every other project page's include order).
- `steel-ball-dispenser.html` had an invalid nested `@media` block (991px/600px queries nested inside the 480px query) — the inner breakpoints could only ever fire at ≤480px regardless of their stated thresholds. Flattened into 3 top-level `@media` rules.
- **Widespread mobile bug in the shared `.project-banner` component**: at narrow widths, `.project-banner` vertically centers `.project-banner-content` while `.back-btn` sits at a small fixed inset from the top. Any page whose title + subtitle wrapped tall enough (which turned out to be 6 of the 9 project pages — pulse-oximeter, pacemaker, stryker, stevens, steel-ball-dispenser, self-balancing-robot — at various widths between ~320-768px, not just one) rendered its heading text underneath/behind the Back button. Fixed once in `styles.css`'s shared `@media (max-width: 768px)` tier by switching `.project-banner` to `align-items: flex-start` and bumping `.project-banner-content`'s top padding to `4.5rem` at the 768/600/480 breakpoints, so content can never grow tall enough to reach the button regardless of title/subtitle length. Verified no regression on the 3 pages that weren't affected (cpu, bsel-projects, sims-pump) and no change at all above 768px (desktop centering untouched). This was a pre-existing bug inherited from the original site's design, not something introduced during migration — worth checking whether the live `jake-golden-portfolio-legacy` site has the same issue if this component pattern is ever reused there.

## Architecture (as actually built — see deviations from the original plan below)

**No build step.** Plain HTML/CSS/JS only — every file is exactly what ships.

**Core pattern**: placeholder-`<div>` injection (the trick `navbar.js`/`footer.js` already used) extended to every repeated piece:

```html
<head>
  <script src="js/head.js"></script>
</head>
<body data-project="pulse-oximeter">
  <div id="navbar-placeholder"></div>
  <script src="js/projects-data.js"></script>
  <script src="js/navbar.js"></script>
  <div id="banner-placeholder"></div>
  <script src="js/project-banner.js"></script>
  <!-- unique per-page content -->
  <div id="footer-placeholder"></div>
  <script src="js/footer.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
  <script src="js/scripts.js"></script>
  <!-- plus js/media-carousel.js, js/gallery-strip.js, js/lightbox.js as needed -->
</body>
```

`js/projects-data.js` must load before `js/navbar.js` on every page (navbar derives its highlight list from it) — it's included right after the navbar placeholder on every page, even non-project pages like index/photography/resume/contact.

**`js/projects-data.js`** is the single source of truth for project metadata: `{ slug, href, title, tagline, categories, keywords, thumbnail, hoverPreview, banner }`. Consumed by `engineering-grid.js` (grid), `navbar.js` (nav highlighting — this structurally fixes the sync bug the live site has), and `project-banner.js` (per-page banner: title, optional `subheading` for 3-line banners, subtitle, background image, optional logo).

**JS modules actually present** (deviates from the original plan's single `carousel.js`):
| File | Role |
|---|---|
| `head.js`, `navbar.js`, `footer.js` | Carried over; `navbar.js` derives highlight list from `projects-data.js` |
| `projects-data.js` | Single source of truth for project metadata |
| `project-banner.js` | Renders each page's banner from `projects-data.js` |
| `engineering-grid.js` | Renders the engineering.html project grid from `projects-data.js` |
| `lightbox.js` | One shared image+video lightbox (was copy-pasted into 5 pages). White background (many engineering-page images are transparent PNGs — schematics/diagrams — that read as illegible on black). Triggers: `.clickable-lightbox` elements (any tag, incl. `<a>` — click is `preventDefault`ed), images inside `.media-carousel`, and `[data-lightbox-video]` elements |
| `media-carousel.js` | Behavior layer for `.media-carousel` — Bootstrap-carousel-based single-slide tiles (schematics, photos in expandable cards, the homepage About Me carousel). Adds description-sync and video-pause-on-slide-change. **Deliberately kept separate from the gallery strip below — see "Two carousel components" note.** |
| `gallery-strip.js` | The lightweight 3-photo-visible browsing strip (Stryker's gallery section only). A genuinely different component, not a `.media-carousel` variant |
| `gallery-thumbs.js`, `gallery-thumbs-check.js` | Carried over as-is (photography page only) |
| `scripts.js` | Expandable-card toggle, project-card hover video play/pause, engineering filter (FLIP animation, reads `data-categories` not freeform tags) |

**Two carousel components, not one** — this deliberately deviates from the original plan (which assumed one `carousel.js` could replace Bootstrap's carousel everywhere). In practice `.media-carousel` (single big slide, Bootstrap-carousel-based) and the gallery-strip (3-photos-at-once browsing) solve different problems and already coexisted on the same pages in the original site. Forcing them into one component would have been a large, risky rewrite for no real benefit — Bootstrap JS is already loaded for the navbar toggle regardless. User confirmed this call.

**Carousel arrow design** (standardized after user feedback comparing Stryker vs. Pacemaker): every `.media-carousel` instance — including the homepage About Me carousel — uses one design defined once in `css/styles.css`: a 36px light-grey (`#f1f3f5`) circular button sitting in a dedicated 44px gutter beside the image (not overlaid on top of it), so it never depends on ambient parent padding or on the content behind it for legibility. This replaced an earlier "dark chevron overlaid on the image" default plus a separate `theme-light-arrows` exception for carousels on dark/video backgrounds — the light-grey button has its own opaque background so it reads fine everywhere, making the exception unnecessary (removed entirely, don't reintroduce it). `#aboutCarousel` on the homepage was widened from 350px to 430px to compensate for the new gutters without shrinking the visible photo.

**Math rendering**: KaTeX only (not MathJax — MathJax was loaded via `polyfill.io`, a service caught injecting malware in 2024; dropped entirely). Delimiter config supports both `$...$`/`$$...$$` and `\(...\)`/`\[...\]` since different original pages used different syntax (pacemaker needed both).

**Images**: `.webp` + one fallback format (`.jpg`/`.png`) per image is intentional, not redundant — webp loads first (faster/cheaper), fallback serves unsupported browsers. Don't collapse to a single format. A future (still out of scope) goal is extending `scripts/thumbs.mjs` to auto-generate the engineering-asset webp variants the way photography's already are.

**`emerson.html` is excluded** from this migration (content-less stub, no source folder even exists for it on the live site).

## Bugs found and fixed during migration (context if something looks off)

- **`.content-box` missing `margin-bottom`**: the original site added `margin-bottom: 2rem` to `.content-box` via a page-level `<style>` override on 6 of 9 project pages (neither shared `.content-box` rule in `styles.css` includes it). Got dropped on 3 pages (pulse-oximeter, pacemaker, self-balancing-robot) during migration, causing stacked boxes to overlap. Fixed — found via a systematic diff of every original page's inline `<style>` selectors against what's reachable in the migrated version (no other instances of this class of bug were found).
- **`assets/profile.jpeg` casing bug**: `index.html` referenced `assets/profile.jpeg` (lowercase) but the real file was `profile.JPEG` (uppercase) — invisible on the live site because the `<picture>` element's webp source wins in every modern browser, but broken for the fallback. Fixed by copying the asset as `profile.jpg` (standard casing) in v3.
- **Dead code removed during index.html migration**: ~150 lines of CSS/JS with zero matching markup — stats counter section, timeline section, floating skill badges, carousel caption overlays, contact CTA section (leftover from an earlier draft), plus a dead smooth-scroll-for-`#`-links script and 4 unused icon SVGs. Confirmed unused via grep before deleting, not guessed.
- **`unused/` folder and 4 legacy draft HTML files** on the live site were never migrated (dead weight, not linked from anywhere) — don't resurrect them.

## Local Dev

`python3 -m http.server 8082` from repo root. Config also lives in the *original* repo's `.claude/launch.json` as `portfolio-v3` (Claude Code's preview tool reads launch configs from its primary working directory) — if working from this repo directly, add an equivalent entry here instead.

## Git Workflow

Do not commit or push without asking first — this supersedes the earlier "commit and push after each validated step" convention this file used to document. Jake wants to review changes and push manually; pushes should happen only at big milestones, not after every small step. If asked to push, treat it as a one-time authorization, not standing permission for the rest of the session.

