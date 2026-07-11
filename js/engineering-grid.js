// Renders the engineering project grid from PROJECTS (js/projects-data.js).
// Tags each card with data-categories, which scripts.js's filter reads.
(function () {
  var CATEGORY_LABEL = { project: 'Project', internship: 'Internship' };

  function cardTagsHTML(categories) {
    var spans = categories.map(function (c) {
      return '<span class="card-tag tag-' + c + '">' + CATEGORY_LABEL[c] + '</span>';
    }).join('');
    return categories.length > 1 ? '<div class="card-tags">' + spans + '</div>' : spans;
  }

  function thumbnailHTML(thumbnail, title) {
    if (!thumbnail.fallback) {
      return '<img class="project-img" src="' + thumbnail.webp + '" alt="' + title + '">';
    }
    return (
      '<picture>' +
        '<source srcset="' + thumbnail.webp + '" type="image/webp">' +
        '<img class="project-img" src="' + thumbnail.fallback + '" alt="' + title + '">' +
      '</picture>'
    );
  }

  function hoverPreviewHTML(hoverPreview, title) {
    if (!hoverPreview) return '';
    if (hoverPreview.type === 'video') {
      return '<video class="project-video" src="' + hoverPreview.src + '" muted loop playsinline></video>';
    }
    // 'gif' and 'image' both render as <img>; scripts.js only calls play()/pause() when supported.
    return '<img class="project-video" src="' + hoverPreview.src + '" alt="' + title + '">';
  }

  function cardHTML(project) {
    return (
      '<div class="col-12 col-md-6 col-lg-4 engineering-item">' +
        '<a href="' + project.href + '" class="text-decoration-none" data-categories="' + project.categories.join(',') + '">' +
          '<div class="project-card mb-3">' +
            cardTagsHTML(project.categories) +
            thumbnailHTML(project.thumbnail, project.title) +
            hoverPreviewHTML(project.hoverPreview, project.title) +
            '<div class="project-overlay">' +
              '<h2 class="fw-bolder">' + project.title + '</h2>' +
              '<p>' + project.tagline + '</p>' +
            '</div>' +
          '</div>' +
        '</a>' +
      '</div>'
    );
  }

  var grid = document.getElementById('engineering-grid');
  if (grid) {
    grid.innerHTML = PROJECTS.map(cardHTML).join('');
  }
})();
