# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project Overview

Clean rebuild of Jake Golden's engineering portfolio (old version is `jake-golden-portfolio-legacy`). This is **Phase 1: code cleanup only** — visual parity with the live site, except reused UI elements (carousel, skill-card, lightbox, project card, banner) get visually unified since their current per-page inconsistency was a bug the user wanted fixed. A full visual redesign is a deliberate, separate later phase — do not get ahead of scope.

Full plan: `/Users/jakegolden/.claude/plans/i-d-always-like-to-adaptive-lake.md` (on the machine this was planned on — read it for full original rationale if present; note the plan predates some decisions below, which supersede it where they conflict).

**Do not modify anything in `/Users/jakegolden/jake-golden-portfolio-legacy`** (the live site — untouched until a deliberate future cutover) or treat `/Users/jakegolden/jake-golden-portfolio-v2/` as a resource — v2 was an earlier, abandoned attempt at this same redesign (uncommitted, no remote, different architecture using Web Components/Shadow DOM/Motion One). The user explicitly chose to ignore it and start fresh as v3. Don't pull code from it.

## Current Phase: dark mode + homepage redesign (Phase 2, committed as of this writing)

Phase 1 (migration, below) is done and committed. Phase 2 — dark mode theming plus a full homepage visual redesign — is now substantially complete and has been committed to `main`. What began as "CSS variables on shared chrome only" (see the original scope note further down) grew, through many follow-up passes, into near-full site coverage: dark/light image-swap infrastructure, a bezel/fill system for transparent diagrams, and per-page hardcoded-color fixes across most project pages. Treat anything not explicitly called out below as still using the original CSS-variable-only theme system.

**Mechanism**: dark-by-default, opt-in light, persisted via `localStorage['theme']` (`'light'` or `'dark'`), no `prefers-color-scheme` involved anywhere.
- Theme is tracked as `data-theme="light"` on `<html>` — its *absence* means dark (the default).
- `js/head.js` injects a synchronous inline `<script>` in `<head>` (via `document.write`, matching its existing non-deferred loading) that reads localStorage and sets `data-theme="light"` before first paint if needed, to prevent a flash of the wrong theme. Nothing is written for the dark case since dark is the unstyled default.
- The toggle button (`#themeToggle`, sun/moon Bootstrap Icon) lives in the shared navbar markup and its click handler in `js/navbar.js` — flips the `data-theme` attribute, writes localStorage, swaps the icon.

**CSS**: "Theme System" block in `css/styles.css` right under `:root` — dark-theme values defined as the `:root` defaults (`--bg`, `--bg-elevated`, `--surface`, `--surface-hover`, `--border`, `--text`, `--text-muted`, `--teal`, `--purple`, `--gradient`, `--shadow`, `--chip-bg`, `--glow-teal`, `--glow-purple`, `--carousel-btn-bg`, `--carousel-btn-bg-hover`, `--carousel-btn-icon`), with a `[data-theme="light"] { ... }` block overriding all of them for light mode. `body` uses `var(--bg)`/`var(--text)` with a transition. Shared chrome (`.nav-wrap`, `.nav-links`, `.theme-toggle`, `.nav-burger`, `footer`) and most reusable components (`.text-gradient`, `.content-box`, `.expandable-card`, `.skill-item`, `.media-carousel` controls, `.isa-table`/`.ctrl-table`) are migrated to these variables. `--text-muted` was deliberately lightened in dark mode (`#a9b0c0`, up from an initial `#9aa1b1`) after review — and a global `.text-muted { color: var(--text-muted) !important; }` rule was added so *all* muted text reacts to theme, not just the subset that happened to sit inside `.expandable-card` (its previous, narrower scope). **Some per-page content still uses hardcoded colors and gets fixed reactively as spotted** (see the per-page list below) — if a box/table/stat-pill/heading looks unstyled/wrong in one theme, check for a page-local `<style>` block redeclaring `.content-box`/similar with a hardcoded `background`/`color` instead of `var(--bg-elevated)`/`var(--text)` — this exact bug pattern recurred on `steel-ball-dispenser.html`, `bsel-projects.html`, and `cpu.html` (all now fixed).

**Dark/light image-swap system** (new since the original Phase 2 scope note): for transparent diagram PNGs/WEBPs whose dark line-art/text disappears against a dark background, there's now a manual dual-asset convention plus swap infrastructure:
- Asset naming: `name-light.png`/`.webp` and `name-dark.png`/`.webp`, hand-produced per image (no auto-generation).
- `<picture>`/`<img>` tags opt in via `data-light-srcset`/`data-dark-srcset` (on `<source>`) and `data-light-src`/`data-dark-src` (on `<img>`).
- **`js/theme-images.js`** (new file) applies the correct variant on page load based on `data-theme`, and re-applies on every click of `#themeToggle`. Must be included via `<script src="js/theme-images.js"></script>` on any page using this pattern (currently: `pulse-oximeter.html`, `self-balancing-robot.html`, `pacemaker.html` — not yet rolled out further).
- Where an image is transparent but *doesn't* have a hand-made dark variant, two CSS opt-in utility classes in `styles.css` provide a solid backing instead: **`.theme-fill-bg`** (scoped to `.media-carousel .carousel-inner`, light-grey `#f2f2f2` fill, dark-mode-only, used on pulse-oximeter's Hardware Front-End / MCU carousels) and **`.dark-fill-white`** (generic, any element, pure white fill + padding + rounded corners as a "bezel," dark-mode-only, used on pacemaker's Hardware Front-End carousel, `stim_circuit`/`stim_pulse`, and both VVI Algorithm images — no border, by design, since a border showed as an unwanted faint outline in light mode).
- `scripts/to-webp.mjs` (new npm script, `npm run to-webp -- <path>`) batch-converts PNG/JPG/JPEG → WebP in place using the `sharp` dependency already in `package.json` — a general-purpose asset tool, not specific to the dark/light workflow, but built to support producing the paired webp variants for these new assets.

**Navbar was structurally rebuilt**, not just re-themed: old Bootstrap navbar markup/classes replaced with hand-rolled `.nav-wrap`/`.nav-inner`/`.nav-links` + a hand-rolled burger menu. Bootstrap's JS collapse component is no longer used for nav (comment in `styles.css` notes this explicitly). Bootstrap bundle JS is still loaded on every page for other components (carousels), so don't remove the `<script>` tag.

**Homepage (`index.html`) got a full rewrite**, not just theme variables — its old hero/gradient/network-canvas/typing-animation markup and inline `<style>` were replaced by a redesign ported from the already-committed static prototype `index1.html` (see `962a1c9 index1 redesign`; there are also uncommitted `index2/3/4.html` prototype drafts at the repo root — those are references/prototypes, not shipped pages). The new homepage markup and CSS are scoped under `#home` in `styles.css` specifically so ported class names that collide with existing site classes (`.project-card`, `.carousel-btn`, `.container`) don't leak onto other pages. Covers hero, `#constellation` canvas background, typing animation, `.scroll-progress` bar, and re-themed about/skills/projects/carousel sections.

**Per-page hardcoded-color fixes made during this phase** (beyond the shared-component work above — check here before assuming a page is untouched):
- `cpu.html`: `.stat-pill` (the "What Can It Run?" stat boxes), `.subcircuit-card`, `.isa-table`/`.ctrl-table` alternating-row background + border + inline `<code>`, and the `.fmt-table`/`.fmt-label` Instruction Formats table were all hardcoded white/light-grey with dark text — fixed to theme variables. Also: the "CPU Architecture" section's Harvard-architecture sentence and the old `.component-pill` icon row were removed and replaced with a new hand-built **5-stage RISC pipeline diagram** (`.pipeline-diagram`/`.pipeline-stage`/`.pipeline-icon`/`.pipeline-arrow`, Bootstrap Icons, rounded-square icon badges using `var(--carousel-btn-bg)`/`var(--carousel-btn-icon)` — deliberately not the teal/purple gradient — connected by arrows that `display:none` below a `768px` breakpoint so the 5 stages never wrap/overflow the content box at intermediate widths).
- `steel-ball-dispenser.html`, `bsel-projects.html`: page-local `.content-box` overrides that fully redeclared `background-color`/`box-shadow` (hardcoded `#fff`) instead of just the legitimately-different `padding`/`margin-bottom` — stripped back to just the intentional deltas so they inherit the shared theme-aware rule again. `steel-ball-dispenser.html`'s `.video-box` (not a shared component, page-local only) got the same var-based treatment directly since it has no shared-rule fallback to inherit from.
- `bsel-projects.html`, `sims-pump.html`: "Process"/"Model Reconstruction" step subheadings (`Generate Head Model`, `Physical Impeller`, etc.) had a hardcoded `color: #595959` — now `var(--text-muted)`. `sims-pump.html`'s inline step-arrow SVGs (`stroke="#373d47"`) now use `stroke="var(--text-muted)"`, matching `cpu.html`'s pipeline arrows.
- **Carousel prev/next buttons** (`.media-carousel .carousel-control-prev/-next`, shared, all pages): were hardcoded light-grey (`#f1f3f5`) with a dark icon regardless of theme — a real bug (not a deliberate "works on any background" choice as originally believed). Fixed to use the existing `--carousel-btn-bg`/`--carousel-btn-bg-hover`/`--carousel-btn-icon` variables (previously only used by the homepage carousel), so every carousel's arrows now correctly go dark-navy/light-icon in dark mode and white/dark-icon in light mode.

**Drive-by fixes bundled into this phase** (not theme-related, found along the way):
- `engineering.html`'s inline `<style>` got theme-reactive `.filter-btn`/`.filter-btn.active` overrides.
- `cpu.html`: dropped a leftover "Test Suite" expandable card.
- `stryker.html`: fixed `height:auto` → fixed `height:240px` on 5 gallery images; replaced the static `tibial_inserts.webp` image with an inline autoplaying/looped/muted `<video>` (`total_knee_replacement.mp4`), capped at `max-height:400px`.
- `pulse-oximeter.html`/`self-balancing-robot.html`/`pacemaker.html`: several `<picture>` tags referenced plain (non-suffixed) image filenames that no longer existed on disk (silently broken `<img>` fallback, masked by the `<source webp>` always winning) — discovered and fixed while wiring up the light/dark swap for those same images.
- `self-balancing-robot.html`: the "Project Overview" working-principle images (3-image row + matching mobile carousel) got per-image captions describing CW/CCW tilt correction, synced between the always-visible row and the carousel via the existing `desc-<carouselId>` convention in `js/media-carousel.js`.
- `bsel-projects.html`: carousel images across Projects 1-3 got fixed heights (uniform slide height instead of variable-aspect-ratio slides) and selective white backgrounds on specific transparent slides.

**Homepage carousel arrow design** (standardized after user feedback comparing Stryker vs. Pacemaker, predates the per-page fixes above but is the origin of the `--carousel-btn-*` variables now reused everywhere): every `.media-carousel` instance uses one design: a 36px circular button sitting in a dedicated 44px gutter beside the image, so it never depends on ambient parent padding or on the content behind it for legibility. `#aboutCarousel` on the homepage was widened from 350px to 430px to compensate for the new gutters without shrinking the visible photo.

## Footer redesign — DONE, rolled out site-wide (Phase 3, committed as of this writing)

The footer was redesigned and the new version is now live on **all 14 content pages** via the shared-chrome layer. It replaces the old single-line copyright footer. The final shipped design differs from the originally-planned concept in `.claude/plans/footer-redesign.md` (that plan proposed an inline-SVG "mopping robot" on 5s dwell; it's now superseded — see below). The design that shipped is "3f — Split columns, scale + fade," which came from a separate Claude Design handoff (`~/Downloads/design_handoff_footer_3f/`) and was prototyped/iterated in `index1.html` before being promoted to the shared layer.

**What the footer is now** (all theme-reactive via CSS variables):
- A single centered column (`.footer-cols`) containing: a borderless muted **"Back to top"** button (`.footer-top-btn`, `bi-arrow-up`, smooth-scrolls to top, plays a one-shot damped **bob** animation on first reveal); a **"Questions? / Contact Me!"** row (`.footer-contact-row` → gradient button linking to `contact.html`); and a muted copyright line (`© 2026 Jake Golden | Built with Care.`).
- **Scroll-linked scale + fade reveal**: `.footer-cols` starts at `opacity:0; scale(0.9)` and interpolates to `opacity:1; scale(1)` tied directly to scroll position (fully reversible, not a one-shot). Skipped under `prefers-reduced-motion` (CSS media query forces it visible).
- An ambient **pixel-art vacuum robot** (real PNG sprites in `assets/robot/`, NOT the originally-planned inline SVG). After the footer stays in view for 3s, the robot walks in from a screen edge, then perpetually wanders to random spots along the footer's top separator line, stopping to either stand still (`idle0`) or vacuum (flip `idle0`/`idle1`); walks by flipping `walking0`/`walking1`; sprites face left by default and mirror (`.facing-right`, `scaleX(-1)`) when moving right. Despawns when the footer scrolls out of view; re-arms on return. Bails out entirely under `prefers-reduced-motion`.

**Architecture — how it's wired (and how to add the footer to a NEW page):**
- **`js/footer.js`** injects the footer markup (replacing `#footer-placeholder`) and runs the scale/fade reveal + back-to-top. This is the shared footer; every page that includes it gets the footer.
- **`js/footer-robot.js`** is a separate module that adds the robot. It's split out **deliberately** so a page can have the footer *without* the robot — just omit this one script. It queries `document.querySelector('footer')`, so **it must load AFTER `js/footer.js`** (neither uses `defer`).
- **`css/styles.css`** holds all footer + robot styles as top-level (NON-`#home`-scoped) rules, right after the shared `footer {}` rule (~line 216+). Robot size is `--footer-robot-size` (default 58px) which must stay in sync with `SIZE` in `js/footer-robot.js`.
- **To add the footer to a new page**, use the standard placeholder pattern in the body, in this order:
  ```html
  <div id="footer-placeholder"></div>
  <script src="js/footer.js"></script>
  <script src="js/footer-robot.js"></script>   <!-- omit this line to skip the robot on this page -->
  ```
  (`bootstrap-icons` is already loaded globally by `js/head.js`, so `bi-arrow-up` resolves everywhere — no extra include needed.)

**Notes / deliberate scope decisions:**
- Robot uses hand-made PNG sprites (Jake's own art) instead of the plan's inline SVG — the PNG approach was chosen during implementation.
- `index1.html` was the build/preview prototype and has been converted to the shared pattern (no more inline footer). `index2.html`/`index3.html` are older rejected footer-concept prototypes — left untouched, still carry their own inline footers, and are not linked from nav (inert scratch files).
- The "Contact Me!" button links to `contact.html` even on `contact.html` itself (harmless self-link, left as-is).
- Tuning constants live at the top of `js/footer-robot.js`: `TRIGGER_DELAY` (3000ms dwell), `IDLE_MIN`/`IDLE_MAX` (3500–6500ms per stop), `SPEED` (60px/s), `FRAME_MS` (420ms sprite flip), `SIZE` (58px). The bob keyframes and `.footer-robot-stage { top: 6px }` (vertical offset from the separator line) live in `css/styles.css`.

## Migration Status: all 13 pages done, all 7 tasks complete (Phase 1, committed)

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

