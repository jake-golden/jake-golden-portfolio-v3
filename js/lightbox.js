// Centralized lightbox — replaces 5 near-identical copy-pasted implementations.
// Supports images and video, wired up three ways:
//   1. Any element with class="clickable-lightbox" + data-full/data-caption
//   2. Images inside a .media-carousel tile (delegated, no per-image markup needed)
//   3. Any element with data-lightbox-video="src.mp4" data-lightbox-caption="..."
// Exposes window.openLightbox/openVideoLightbox/closeLightbox for callers
// that still need programmatic control.
(function () {
  var lightboxHTML =
    '<div class="lightbox" id="lightbox" aria-hidden="true">' +
      '<div class="lightbox-content">' +
        '<button class="lightbox-close" id="lightboxClose" aria-label="Close">&#10005;</button>' +
        '<img id="lightboxImg" class="lightbox-img" alt="Expanded view">' +
        '<video id="lightboxVideo" class="lightbox-video" controls>' +
          '<source id="lightboxVideoSource" src="" type="video/mp4">' +
          'Your browser does not support the video tag.' +
        '</video>' +
        '<div id="lightboxCaption" class="lightbox-caption"></div>' +
      '</div>' +
    '</div>';

  function init() {
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    var lightbox = document.getElementById('lightbox');
    var closeBtn = document.getElementById('lightboxClose');
    var imgEl = document.getElementById('lightboxImg');
    var videoEl = document.getElementById('lightboxVideo');
    var videoSource = document.getElementById('lightboxVideoSource');
    var captionEl = document.getElementById('lightboxCaption');

    function openImage(src, caption, alt) {
      imgEl.src = src;
      imgEl.alt = alt || 'Expanded view';
      imgEl.style.display = 'block';
      videoEl.style.display = 'none';
      videoEl.pause();
      captionEl.textContent = caption || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function openVideo(src, caption) {
      videoSource.src = src;
      videoEl.load();
      videoEl.style.display = 'block';
      imgEl.style.display = 'none';
      captionEl.textContent = caption || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      videoEl.play().catch(function () {});
    }

    function close() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      imgEl.src = '';
      imgEl.style.display = 'block';
      videoEl.pause();
      videoEl.style.display = 'none';
      videoSource.src = '';
      document.body.style.overflow = '';
    }

    window.openLightbox = openImage;
    window.openVideoLightbox = openVideo;
    window.closeLightbox = close;

    document.querySelectorAll('.clickable-lightbox, .media-carousel img').forEach(function (img) {
      if (!img.title) img.title = 'Click to expand';
    });

    // Standalone clickable images — capture phase so this wins over any
    // stopPropagation on ancestor elements (e.g. expandable cards).
    document.addEventListener('click', function (e) {
      var img = e.target.closest && e.target.closest('.clickable-lightbox');
      if (!img || img.closest('.media-carousel')) return; // carousel images handled below
      e.preventDefault(); // no-op for <img>, stops <a href="#"> from jumping/scrolling
      e.stopPropagation();
      openImage(img.getAttribute('data-full') || img.src, img.getAttribute('data-caption') || img.alt, img.alt);
    }, true);

    // Images inside media-carousel tiles (delegated per carousel root).
    document.querySelectorAll('.media-carousel').forEach(function (root) {
      root.addEventListener('click', function (e) {
        var img = e.target.closest && e.target.closest('img');
        if (!img || !root.contains(img)) return;
        openImage(img.getAttribute('data-full') || img.src, img.getAttribute('data-caption') || img.alt, img.alt);
      });
    });

    // Declarative video triggers.
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('[data-lightbox-video]');
      if (!trigger) return;
      openVideo(trigger.getAttribute('data-lightbox-video'), trigger.getAttribute('data-lightbox-caption') || '');
    });

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
