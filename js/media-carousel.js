// Behavior layer for .media-carousel — a Bootstrap carousel (single slide +
// prev/next) used inside expandable info tiles. The sliding itself is plain
// Bootstrap carousel JS (already loaded site-wide); this only adds two
// recurring behaviors that used to be copy-pasted per page:
//   1. Optional slide-synced description text: a carousel with id="foo" and
//      a sibling #desc-foo containing .desc-slide children stays in sync.
//   2. Pausing any <video> inside a slide when the carousel advances away
//      from it, and stopping video-control clicks from also changing slides.
(function () {
  function bindDescriptionSync(carousel) {
    var descContainer = document.getElementById('desc-' + carousel.id);
    if (!descContainer) return;
    var descs = descContainer.querySelectorAll('.desc-slide');
    if (!descs.length) return;
    carousel.addEventListener('slid.bs.carousel', function () {
      var items = Array.from(carousel.querySelectorAll('.carousel-item'));
      var idx = items.findIndex(function (item) { return item.classList.contains('active'); });
      descs.forEach(function (ul, i) { ul.classList.toggle('d-none', i !== idx); });
    });
  }

  function bindVideoHandling(carousel) {
    carousel.querySelectorAll('video').forEach(function (vid) {
      vid.addEventListener('click', function (e) { e.stopPropagation(); });
      vid.addEventListener('dblclick', function (e) { e.stopPropagation(); });
    });
    carousel.addEventListener('slide.bs.carousel', function () {
      carousel.querySelectorAll('video').forEach(function (v) {
        try { v.pause(); } catch (_) {}
      });
    });
  }

  function init() {
    document.querySelectorAll('.media-carousel').forEach(function (carousel) {
      bindDescriptionSync(carousel);
      bindVideoHandling(carousel);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
