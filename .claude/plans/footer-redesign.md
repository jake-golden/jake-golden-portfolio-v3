# Footer Redesign: Scroll-Reveal Content + Dwell-Time Mopping Robot

## Context

The site's footer (`js/footer.js`) is currently a single hardcoded line — `&copy; 2025 Jake Golden. All rights reserved.` — identical and static on all 14 pages, with zero interactivity. Jake wants his footer to feel like the rest of the site (which already has playful, hand-built touches: the homepage's `#constellation` canvas, typing animation, scroll-reveal). After brainstorming several directions (project links, music player, ambient backgrounds, easter eggs), Jake scoped this round down to exactly two features, confirmed directly with him:

1. A scroll-triggered reveal of real footer content (contact links + copyright + a fun message), replacing the static line.
2. A small pixelated robot that wanders onto the footer and "mops" if the user dwells on the footer for 5+ seconds — a whimsical, on-brand touch with no real-world equivalent elsewhere on the site.

"Hungry for More" project links and a music player were explicitly deferred to a possible future round — do not build them now.

## Approach

### Files touched
- **`js/footer.js`** (modified) — richer footer markup (contact icons + copyright + message + a robot mount point) and the text scroll-reveal behavior. Same responsibility split as `js/navbar.js` (injection + one behavior in one file).
- **`js/footer-robot.js`** (new) — the dwell-timer/visibility state machine and the walk-in → wander → walk-out robot animation. Kept separate from `footer.js` because it's a non-trivial, self-contained state machine — matches the codebase's existing convention of one focused module per concern (`media-carousel.js` vs `gallery-strip.js` vs `lightbox.js` are all split this way already).
- **`css/styles.css`** (modified) — new footer content styles, new reveal classes, robot SVG + keyframe styles, appended directly after the existing footer block (currently lines 216-236).
- **All 14 HTML pages** — add one line, `<script src="js/footer-robot.js"></script>`, immediately after each page's existing `<script src="js/footer.js"></script>` (confirmed identical placement on all 14 pages via direct grep). Order matters since neither script uses `defer`: `footer.js` must inject the footer markup (including the robot's mount point) before `footer-robot.js` queries for it.

### New footer markup (built in `footer.js`, same placeholder `outerHTML` swap as today)
```html
<footer>
  <div class="footer-inner">
    <div class="footer-content fade-in-up-footer" id="footerContent">
      <div class="footer-contact">
        <a href="https://www.linkedin.com/in/jakegolden22/" target="_blank" class="footer-icon-link" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
        <a href="mailto:jakegolden9001@gmail.com" target="_blank" class="footer-icon-link" aria-label="Email"><i class="bi bi-envelope-fill"></i></a>
      </div>
      <p class="footer-copyright">&copy; 2025 Jake Golden. All rights reserved.</p>
      <p class="footer-fun-message">Built with late nights, strong coffee, and one suspiciously helpful robot.</p>
    </div>
  </div>
  <div class="footer-robot-stage" id="footerRobotStage" aria-hidden="true"></div>
</footer>
```
- Contact links/icons reused verbatim from `contact.html` (LinkedIn `jakegolden22`, `mailto:jakegolden9001@gmail.com`, `bi-linkedin`/`bi-envelope-fill` — Bootstrap Icons already loaded site-wide via `js/head.js`, no new dependency).
- `<footer>`'s existing rules (`position: relative; z-index: 1; margin-top: auto; ...`) stay untouched — this is what already solves the `index.html` constellation-canvas stacking problem, and all new children inherit that stacking context for free.
- `.footer-robot-stage` is a permanent, empty, `pointer-events: none` mount div — a sibling of the reveal-gated content, so the robot's presence is never affected by the text-reveal opacity/transform. `footer-robot.js` appends/removes the actual SVG element into it on trigger.
- The "fun message" text is a placeholder — flag it to Jake as the one line he'll likely want to swap for his own wording.

### Scroll-reveal (in `footer.js`)
Reuse the exact pattern already in `index.html` (rAF-throttled scroll listener + low-frequency interval safety net, explicitly *not* `IntersectionObserver` per that file's own comment: "IntersectionObserver never fires in some embedded browsers"). The existing `.fade-in-up`/`.reveal` CSS classes are scoped `#home .fade-in-up` (styles.css:1347) so they don't apply outside the homepage — add new top-level, non-scoped classes instead:
```css
.fade-in-up-footer { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
.fade-in-up-footer.reveal { opacity: 1; transform: translateY(0); }
```
Plus new layout CSS for `.footer-inner`, `.footer-contact`, `.footer-icon-link` (hover state using `var(--teal)`), `.footer-copyright`, `.footer-fun-message` — all theme-variable-driven (`var(--text-muted)`, `var(--border)`, `var(--chip-bg)`), consistent with the rest of the theme system.

### Dwell-time robot (in `js/footer-robot.js`)
- **Visibility check**: same heuristic as the existing reveal (`rect.top < vh*0.85 && rect.bottom > 0`), but unlike the reveal's one-shot "reveal once and forget," this needs continuous tracking since the robot can be triggered repeatedly across a session. Runs via a `setInterval(check, 400)` that is never cleared, plus a scroll/resize listener throttled with `requestAnimationFrame`.
- **Dwell timer**: on transition into view, start a `setTimeout(..., 5000)`. On transition out of view before it fires, `clearTimeout` — a full reset, no partial credit, matching the plain reading of "if the user views the footer for more than 5 seconds."
- **On-load case**: `check()` runs once synchronously right after listeners attach (mirroring `index.html`'s pattern), so a short page where the footer is already visible on load (e.g. `contact.html`) starts the dwell timer immediately with zero scrolling required.
- **Trigger gate**: a `robotState` flag (`'idle' | 'active'`) prevents any overlapping runs, plus a cooldown timestamp (recommended default: 20s after each completed run) before it can retrigger. **Design default, flagged as adjustable**: the robot is re-triggerable every time the user dwells on the footer again (scroll away and back = a fresh dwell), not a one-time-ever event — this rewards repeat visits without spamming on rapid re-scrolls.
- **`prefers-reduced-motion: reduce`**: `footer-robot.js` bails out entirely at the top of the file (no timers, no robot, ever) — a stronger response than the text reveal's "instant snap" treatment, since motion is this feature's entire point.

### Robot appearance and animation
Built as **inline SVG + CSS**, not image assets — deliberately avoiding the site's existing dark/light PNG-swap convention (used for diagrams elsewhere), since that would require Jake to hand-produce sprite art for a decorative throwaway animation. Theme-safety comes from `stroke: var(--border)` on every shape (guarantees a visible outline against both `--bg-elevated` values) plus fills from `var(--chip-bg)`/`var(--text-muted)`/`var(--teal)`/`var(--purple)` — zero new assets, fully theme-reactive automatically.

- **Legs/arm**: looping CSS `@keyframes` (`robot-leg-walk` alternating rotation, `robot-mop-swing` for the arm) active the entire time a `.animating` class is present — i.e. continuously through walk-in, every wander hop, and walk-out, which is what sells "walking + mopping" as one continuous action rather than three disconnected animations.
- **Horizontal movement**: driven by JS setting `transform: translateX(<npx>)` with a `transition` (not keyframes), so exact distances/durations can be computed dynamically:
  1. **Walk-in**: enters from a randomly chosen side (off-stage at `-50px` or `stageWidth+10px`), moves to a resting point (~15% or ~85% of stage width) over ~1.4s.
  2. **Wander**: 3–5 randomized hops within the middle 15%–85% of the stage width, each with a distance-proportional duration (min 500ms) and a randomized 0.3–1.2s pause between hops.
  3. **Walk-out**: exits off whichever side is nearer to its final wander position, over ~1.4s, then the SVG element is removed from the DOM and `robotState` resets to `'idle'` (cooldown starts here).
- `.footer-robot.facing-left { transform: scaleX(-1); }` mirrors the sprite (authored facing right by default) whenever moving leftward, toggled automatically by the movement helper based on direction of travel.

### Edge cases already accounted for
- **Busy background above the footer** (`photography.html`'s gallery grid): footer is already a visually distinct band (own `background: var(--bg-elevated)` + `border-top`), so no gallery-specific CSS is anticipated — just confirm visually in verification.
- **Narrow/mobile widths**: `.footer-robot-stage` is `width: 100%` of `<footer>`, so wander bounds (percentages of stage width) scale down naturally; no separate mobile CSS needed for the robot itself, but confirm the icon row/text don't wrap awkwardly.
- Increase existing footer `padding` from `2rem 0` to `2rem 0 3.75rem` to reserve permanent room for the robot strip at the bottom (simplest option — doesn't depend on JS-added classes, so layout doesn't jump when the robot first appears).

## Verification

Manual browser check (start the existing `python3 -m http.server 8082` / `portfolio-v3` launch config):
1. **`index.html`** — confirm footer text and robot render above the `#constellation` canvas (the existing `position:relative;z-index:1` on `<footer>` should already guarantee this with no changes needed).
2. **One project page** (`cpu.html` or `pacemaker.html`) — scroll to the bottom, confirm dwell timer fires after 5s and the robot completes a full walk-in/wander/walk-out cycle without visual glitches.
3. **`contact.html`** (short page) — confirm the footer is visible on initial load and the dwell timer starts without any scrolling.
4. **`photography.html`** — confirm the footer/robot read cleanly against the gallery content directly above.
5. **Both themes** — toggle `data-theme="light"` via the existing navbar toggle on each page above; re-check text contrast and robot stroke/fill visibility in both modes.
6. **Both viewport sizes** — desktop (~1280px+) and mobile (~375px) — confirm no awkward wrapping and the robot's wander bounds stay within the stage.
7. **Functional edge cases** — confirm the dwell timer resets (never fires) if the footer scrolls out of view before 5s; confirm the robot cannot double-trigger by rapidly scrolling away and back mid-sequence; confirm the cooldown prevents an immediate retrigger right after a run completes, but does allow one after the cooldown window; confirm with OS "reduce motion" enabled that the robot never appears while footer text still reveals (instantly, no animation).
