// Swaps <img>/<source> elements to a dark-mode variant when data-theme="light" is absent.
// Elements opt in via data-light-src/data-dark-src (img) or data-light-srcset/data-dark-srcset (source).
(function () {
  function applyTheme() {
    var dark = document.documentElement.getAttribute('data-theme') !== 'light';

    document.querySelectorAll('img[data-light-src][data-dark-src]').forEach(function (img) {
      img.src = dark ? img.dataset.darkSrc : img.dataset.lightSrc;
    });

    document.querySelectorAll('source[data-light-srcset][data-dark-srcset]').forEach(function (source) {
      source.srcset = dark ? source.dataset.darkSrcset : source.dataset.lightSrcset;
    });
  }

  applyTheme();

  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', applyTheme);
  }
})();
