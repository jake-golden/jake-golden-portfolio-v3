// Centralized navbar component
// Injected synchronously via a placeholder div on each page.
// Run without defer/async so the navbar renders immediately during parsing.
(function () {
  var navbarHTML = `
    <div class="nav-wrap">
      <nav class="nav-inner">
        <a class="nav-brand text-gradient" href="index.html">Jake Golden</a>
        <div style="display:flex; align-items:center; gap:1rem;">
          <div class="nav-links" id="navLinks">
            <a href="index.html">Home</a>
            <a href="engineering.html">Engineering</a>
            <a href="photography.html">Photography</a>
            <a href="resume.html">Resume</a>
            <a href="contact.html">Contact</a>
          </div>
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle light/dark theme"><i class="bi bi-sun-fill"></i></button>
          <button class="nav-burger" id="navBurger" aria-label="Toggle navigation"><i class="bi bi-list"></i></button>
        </div>
      </nav>
    </div>`;

  // Inject navbar synchronously — placeholder element is already in the DOM at this point
  var placeholder = document.getElementById('navbar-placeholder');
  if (placeholder) {
    placeholder.outerHTML = navbarHTML;
  }

  // ----- Theme toggle -----
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    var icon = themeBtn.querySelector('i');
    var syncIcon = function () {
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      icon.className = light ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    };
    themeBtn.addEventListener('click', function () {
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      if (light) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
      syncIcon();
    });
    syncIcon();
  }

  // ----- Mobile nav -----
  var burger = document.getElementById('navBurger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.getElementById('navLinks').classList.toggle('open');
    });
  }

  // Pages that live under the Engineering section — derived from the single
  // source of truth in projects-data.js, not hand-maintained here. This is
  // what structurally fixes the old sync bug (nav forgetting new project pages).
  var engineeringSubPages = (typeof PROJECTS !== 'undefined')
    ? PROJECTS.map(function (p) { return p.href; })
    : [];

  function setActiveNav() {
    var filename = window.location.pathname.split('/').pop() || 'index.html';

    // Project sub-pages highlight the Engineering link
    var activeHref = filename;
    if (engineeringSubPages.indexOf(filename) !== -1) {
      activeHref = 'engineering.html';
    }

    document.querySelectorAll('#navLinks a').forEach(function (link) {
      if (link.getAttribute('href') === activeHref) {
        link.classList.add('active');
      }
    });
  }

  // The nav is already in the DOM (injected above), but wait for full parse
  // before querying its links, in case the browser is still mid-parse.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setActiveNav);
  } else {
    setActiveNav();
  }
})();
