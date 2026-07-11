// Lightweight thumbnail-strip carousel (.carousel-container) — a different
// component from media-carousel.js: shows 1-3 images side by side and scrolls
// by one at a time, for browsing a batch of photos rather than a single
// large slide per tile. Fully custom (no Bootstrap carousel involved).
document.querySelectorAll('.carousel-container').forEach(function (container) {
  var track = container.querySelector('.carousel-track');
  var items = container.querySelectorAll('.carousel-item-custom');
  var prevBtn = container.querySelector('.carousel-btn.prev');
  var nextBtn = container.querySelector('.carousel-btn.next');
  var index = 0;
  var visibleCount = 3;

  function getVisibleCount() {
    var w = window.innerWidth || document.documentElement.clientWidth;
    if (w >= 992) return 3;
    if (w >= 600) return 2;
    return 1;
  }

  function updateCarousel() {
    track.style.transform = 'translateX(-' + (index * (100 / visibleCount)) + '%)';
  }

  function clampIndex() {
    var maxIndex = Math.max(0, items.length - visibleCount);
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (index < items.length - visibleCount) index++;
      else index = 0;
      updateCarousel();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (index > 0) index--;
      else index = Math.max(0, items.length - visibleCount);
      updateCarousel();
    });
  }

  function onResize() {
    var newVisible = getVisibleCount();
    if (newVisible !== visibleCount) {
      visibleCount = newVisible;
      items.forEach(function (it) { it.style.flex = '0 0 ' + (100 / visibleCount) + '%'; });
      clampIndex();
      updateCarousel();
    }
  }

  visibleCount = getVisibleCount();
  items.forEach(function (it) { it.style.flex = '0 0 ' + (100 / visibleCount) + '%'; });
  clampIndex();
  updateCarousel();

  window.addEventListener('resize', onResize);
});
