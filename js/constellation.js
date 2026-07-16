// Full-page golden-spiral constellation background (mouse-tracking).
// Ported from index.html's inline script so it can be reused on other pages.
// Requires a <canvas id="constellation"></canvas> element in the page body.
(function () {
  const canvas = document.getElementById("constellation");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Viewport size with fallbacks: some embedded/preview browsers report
  // window.innerWidth/innerHeight (and even clientWidth/Height) as 0,
  // which silently breaks any resize math.
  function viewportW() {
    return window.innerWidth || document.documentElement.clientWidth || (window.screen && screen.width) || 1280;
  }
  function viewportH() {
    return window.innerHeight || document.documentElement.clientHeight || (window.screen && screen.height) || 800;
  }

  let width, height, dpr;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = viewportW();
    height = viewportH();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);
  // Fallback for environments where the viewport size settles late and
  // no resize event fires
  setInterval(() => {
    if (viewportW() !== width || viewportH() !== height) resize();
  }, 1000);

  const mouse = { x: null, y: null };
  let holding = false; // mouse button held down = golden-spiral mode
  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; stopHolding(); });

  const TEAL = [77, 163, 179];
  const PURPLE = [156, 140, 212];
  const BASE_SPEED = 0.16;      // px/frame wandering speed (slow drift)
  const MAX_DIST = 140;         // node-to-node link distance
  const REPEL_RADIUS = 160;     // hover repel radius
  const REPEL_STRENGTH = 0.55;  // hover repel force
  const SPIRAL_RADIUS = 220;    // capture radius around the cursor while held
  const SPIRAL_MIN = 34;        // inner orbit band — nodes won't collapse in
  const SPIRAL_SPEED_MIN = 0.7; // slow, calm orbit speed
  const SPIRAL_SPEED_MAX = 1.3;
  // Golden (logarithmic) spiral: r = a·e^(bθ) with b = ln(φ)/(π/2).
  // The constant pitch angle atan(b) ≈ 17° is what we steer nodes along.
  const PITCH = Math.atan(Math.log((1 + Math.sqrt(5)) / 2) / (Math.PI / 2));

  class Node {
    constructor(x, y, vx, vy) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : Math.random() * height;
      const ang = Math.random() * Math.PI * 2;
      this.vx = vx !== undefined ? vx : Math.cos(ang) * BASE_SPEED;
      this.vy = vy !== undefined ? vy : Math.sin(ang) * BASE_SPEED;
      this.radius = 2.5;
      this.mix = Math.random(); // teal↔purple blend
    }
    color(alpha) {
      const r = Math.round(TEAL[0] + (PURPLE[0] - TEAL[0]) * this.mix);
      const g = Math.round(TEAL[1] + (PURPLE[1] - TEAL[1]) * this.mix);
      const b = Math.round(TEAL[2] + (PURPLE[2] - TEAL[2]) * this.mix);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    update() {
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (holding && dist < SPIRAL_RADIUS && dist > 0.01) {
          // Outward radial unit vector and its counterclockwise tangent
          const rx = dx / dist, ry = dy / dist;
          const tx = -ry, ty = rx;
          // Steer along the golden-spiral pitch: mostly tangential,
          // with an inward pull that fades to zero at the inner band
          // so nodes orbit instead of collapsing onto the cursor.
          const inward = Math.sin(PITCH) * Math.max(0, (dist - SPIRAL_MIN) / (SPIRAL_RADIUS - SPIRAL_MIN));
          const speed = SPIRAL_SPEED_MIN + (SPIRAL_SPEED_MAX - SPIRAL_SPEED_MIN) * (1 - dist / SPIRAL_RADIUS);
          const desiredX = (tx * Math.cos(PITCH) - rx * inward) * speed;
          const desiredY = (ty * Math.cos(PITCH) - ry * inward) * speed;
          // Steering strength ramps up the closer the node is
          const grip = 0.1 + 0.12 * (1 - dist / SPIRAL_RADIUS);
          this.vx += (desiredX - this.vx) * grip;
          this.vy += (desiredY - this.vy) * grip;
        } else if (!holding && dist < REPEL_RADIUS && dist > 0.01) {
          // Gentle push directly away from the cursor
          const rx = dx / dist, ry = dy / dist;
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          this.vx += rx * force;
          this.vy += ry * force;
        }
      }
      // Relax back toward calm wandering speed when free
      const speed = Math.hypot(this.vx, this.vy);
      const relaxTarget = holding ? SPIRAL_SPEED_MIN : BASE_SPEED;
      if (speed > relaxTarget) {
        const relax = 0.97;
        this.vx *= relax;
        this.vy *= relax;
      }
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color(0.45);
      ctx.fill();
    }
  }

  const nodes = [];
  // Scale node density with viewport area, within sane bounds
  const initialCount = Math.max(60, Math.min(100, Math.round((width * height) / 16000)));
  for (let i = 0; i < initialCount; i++) nodes.push(new Node());

  // Press and hold on the page background = a "source": existing nodes
  // near the cursor spiral around it for as long as the button is held.
  // No new nodes are spawned — holding never changes the total node count.
  function startHolding() { holding = true; }
  function stopHolding() { holding = false; }
  document.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("a, button, input, .about-box, .about-carousel, .skill-card, .project-card, .nav-wrap, img, picture")) return;
    startHolding();
  });
  document.addEventListener("mouseup", stopHolding);
  window.addEventListener("blur", stopHolding);

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = nodes[i].color(0.26 * (1 - distance / MAX_DIST));
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      if (holding && mouse.x !== null) {
        const dx = nodes[i].x - mouse.x;
        const dy = nodes[i].y - mouse.y;
        const distance = Math.hypot(dx, dy);
        if (distance < SPIRAL_RADIUS) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = nodes[i].color(0.34 * (1 - distance / SPIRAL_RADIUS));
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();
    nodes.forEach((n) => { n.update(); n.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();
