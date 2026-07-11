// Centralized navbar component
// Injected synchronously via a placeholder div on each page.
// Run without defer/async so the navbar renders immediately during parsing.
(function () {
  var navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-white py-3">
      <div class="container px-5">
        <a class="navbar-brand fw-bolder text-primary" href="index.html">Jake Golden</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto small fw-bolder">
            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="engineering.html">Engineering</a></li>
            <li class="nav-item"><a class="nav-link" href="photography.html">Photography</a></li>
            <li class="nav-item"><a class="nav-link" href="resume.html">Resume</a></li>
            <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>`;

  // Inject navbar synchronously — placeholder element is already in the DOM at this point
  var placeholder = document.getElementById('navbar-placeholder');
  if (placeholder) {
    placeholder.outerHTML = navbarHTML;
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

    document.querySelectorAll('#navbarNav .nav-link').forEach(function (link) {
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
