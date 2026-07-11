// Centralized project banner component.
// Reads the current page's slug from <body data-project="..."> and looks it
// up in PROJECTS (js/projects-data.js) to render the banner — title, subtitle,
// background image, and optional logo all come from that single record.
(function () {
  function backgroundImageCSS(bg) {
    if (!bg) return 'none';
    if (!bg.fallback) return "url('" + bg.webp + "')";
    return (
      "image-set(url('" + bg.webp + "') type('image/webp'), url('" + bg.fallback + "') type('image/png'))"
    );
  }

  function bannerHTML(project) {
    var b = project.banner;
    var titleHTML = (b.title || '').split('\n').join('<br>');
    var subheadingHTML = b.subheading ? '<h2>' + b.subheading + '</h2>' : '';
    var logoHTML = b.logo
      ? '<img src="' + b.logo + '" alt="' + project.title + ' Logo" class="banner-logo">'
      : '';
    return (
      '<div class="project-banner">' +
        '<a href="engineering.html" class="back-btn"><i class="bi bi-arrow-left"></i>Back</a>' +
        '<div class="project-banner-overlay"></div>' +
        '<div class="project-banner-content">' +
          '<h1>' + titleHTML + '</h1>' +
          subheadingHTML +
          '<p>' + b.subtitle + '</p>' +
        '</div>' +
        logoHTML +
      '</div>'
    );
  }

  var placeholder = document.getElementById('banner-placeholder');
  if (!placeholder) return;

  var slug = document.body.getAttribute('data-project');
  var project = (typeof PROJECTS !== 'undefined') ? PROJECTS.find(function (p) { return p.slug === slug; }) : null;
  if (!project || !project.banner) return;

  placeholder.outerHTML = bannerHTML(project);

  // Background image is per-project data, not something the shared stylesheet
  // can express — inject a tiny scoped style rule instead of a page-level <style> block.
  var styleTag = document.createElement('style');
  styleTag.textContent = '.project-banner::before { background-image: ' + backgroundImageCSS(project.banner.backgroundImage) + '; }';
  document.head.appendChild(styleTag);
})();
