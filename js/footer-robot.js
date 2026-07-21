// Dwell robot: wanders the footer while it's in view, vacuuming at each stop.
// Must load AFTER js/footer.js (it queries the <footer> that footer.js injects).
// Include per-page — omit this script on any page that shouldn't show the robot.
(function () {
  var footerEl = document.querySelector('footer');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!footerEl || reduced) return;

  var SIZE = 58; // px — keep in sync with --footer-robot-size in css/styles.css
  var FRAME_MS = 420; // idle/walk sprite flip interval
  var TRIGGER_DELAY = 3000; // ms footer must stay continuously in view before the robot enters
  var IDLE_MIN = 3500, IDLE_MAX = 6500; // ms spent idling/vacuuming at each stop
  var SPEED = 60; // px/sec walking speed
  var IDLE_FRAMES = ['assets/robot/idle0.png', 'assets/robot/idle1.png'];
  var WALK_FRAMES = ['assets/robot/walking0.png', 'assets/robot/walking1.png'];

  var stage = document.createElement('div');
  stage.className = 'footer-robot-stage';
  stage.setAttribute('aria-hidden', 'true');
  footerEl.appendChild(stage);

  var wrap = null, img = null, frameTimer = null, stepTimer = null, dwellTimer = null;
  var currentX = 0;
  var present = false;

  function vh() { return window.innerHeight || document.documentElement.clientHeight || 800; }
  // Strict "is the footer on screen at all" check — used only to arm the
  // spawn dwell timer, unchanged from before.
  function footerInView() {
    var rect = footerEl.getBoundingClientRect();
    return rect.top < vh() && rect.bottom > 0;
  }
  // Looser check used only once the robot is already present: without this,
  // despawn fired the instant the footer was nominally 0px out of view (e.g.
  // scrolling back up away from the page bottom), which could pop the robot
  // out while it was still visibly on screen near the edge. Now it stays
  // until the viewport has scrolled a further 2 robot-heights past that
  // point on either edge.
  var EXIT_MARGIN = SIZE * 2;
  function footerWithinExitBuffer() {
    var rect = footerEl.getBoundingClientRect();
    return rect.top < vh() + EXIT_MARGIN && rect.bottom > -EXIT_MARGIN;
  }
  function stageWidth() { return footerEl.getBoundingClientRect().width || 300; }

  function playFrames(frames) {
    clearInterval(frameTimer);
    var i = 0;
    img.src = frames[0];
    frameTimer = setInterval(function () { i = 1 - i; img.src = frames[i]; }, FRAME_MS);
  }

  function showFrame(src) {
    clearInterval(frameTimer);
    img.src = src;
  }

  function walkTo(targetX, onDone) {
    playFrames(WALK_FRAMES);
    var dist = targetX - currentX;
    img.classList.toggle('facing-right', dist > 0);
    var duration = Math.max(400, Math.abs(dist) / SPEED * 1000);
    // Pin the true current position with no transition and force a reflow
    // before starting the move, so the walk always animates from where the
    // robot actually is. Without this, a freshly-spawned wrap could transition
    // from a stale identity transform — the robot slid in too fast and facing
    // the wrong way.
    wrap.style.transition = 'none';
    wrap.style.transform = 'translateX(' + currentX + 'px)';
    void wrap.offsetWidth;
    wrap.style.transition = 'transform ' + duration + 'ms linear';
    wrap.style.transform = 'translateX(' + targetX + 'px)';
    currentX = targetX;
    stepTimer = setTimeout(function () { if (present) onDone(); }, duration);
  }

  function idleThenWalk() {
    if (!present) return;
    // Two idle behaviors, picked at random: stand still (idle0 only, no
    // vacuum) or stand and vacuum (flip idle0/idle1).
    if (Math.random() < 0.5) {
      showFrame(IDLE_FRAMES[0]);
    } else {
      playFrames(IDLE_FRAMES);
    }
    var idleTime = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
    stepTimer = setTimeout(function () {
      if (!present) return;
      var w = stageWidth();
      var margin = SIZE * 0.5;
      var nextX = margin + Math.random() * Math.max(0, w - margin * 2);
      walkTo(nextX, idleThenWalk);
    }, idleTime);
  }

  function spawn() {
    present = true;
    wrap = document.createElement('div');
    wrap.className = 'footer-robot-wrap';
    img = document.createElement('img');
    img.className = 'footer-robot-sprite';
    img.alt = '';
    wrap.appendChild(img);
    stage.appendChild(wrap);

    var w = stageWidth();
    var fromLeft = Math.random() < 0.5;
    currentX = fromLeft ? -SIZE : w;
    wrap.style.transform = 'translateX(' + currentX + 'px)';

    var restX = fromLeft ? w * 0.2 : w * 0.8;
    walkTo(restX, idleThenWalk);
  }

  function despawn() {
    present = false;
    clearInterval(frameTimer);
    clearTimeout(stepTimer);
    if (wrap) { wrap.remove(); wrap = null; img = null; }
  }

  function checkVisibility() {
    if (present) {
      if (!footerWithinExitBuffer()) despawn();
      return;
    }
    if (footerInView()) {
      if (!dwellTimer) {
        dwellTimer = setTimeout(function () {
          dwellTimer = null;
          if (footerInView()) spawn();
        }, TRIGGER_DELAY);
      }
    } else if (dwellTimer) {
      clearTimeout(dwellTimer);
      dwellTimer = null;
    }
  }

  setInterval(checkVisibility, 400);
  window.addEventListener('scroll', function () { requestAnimationFrame(checkVisibility); }, { passive: true });
  window.addEventListener('resize', checkVisibility);
  checkVisibility();
})();
