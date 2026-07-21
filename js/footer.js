(function () {
  var footerHTML =
    '<footer>' +
      '<div class="footer-cols" id="footerCols">' +
        '<button type="button" class="footer-top-btn" id="footerToTop"><i class="bi bi-arrow-up"></i> Back to top</button>' +
        '<div class="footer-contact-row">' +
          '<span class="footer-questions">Questions?</span>' +
          '<a href="contact.html" class="footer-contact-btn">Let\'s Talk!</a>' +
        '</div>' +
        '<p class="footer-copyright">&copy; 2026 Jake Golden &ensp;|&ensp; Built with Care.</p>' +
      '</div>' +
    '</footer>';

  var placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.outerHTML = footerHTML;
  }

  var footerEl = document.querySelector('footer');
  var cols = document.getElementById('footerCols');
  var toTopBtn = document.getElementById('footerToTop');
  if (!footerEl || !cols || !toTopBtn) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- scroll-linked scale + fade (fully reversible, tied directly to scroll position) -----
  function computeProgress() {
    var rect = footerEl.getBoundingClientRect();
    var footerH = rect.height || 1;
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var p = (vh - rect.top) / footerH;
    return Math.max(0, Math.min(1, p));
  }
  var bobbed = false;
  function apply() {
    var p = computeProgress();
    cols.style.opacity = p;
    cols.style.transform = 'scale(' + (0.9 + p * 0.1) + ')';
    if (!bobbed && p > 0.05) {
      bobbed = true;
      toTopBtn.classList.add('bob');
    }
  }
  if (!reduced) {
    window.addEventListener('scroll', function () { requestAnimationFrame(apply); }, { passive: true });
    window.addEventListener('resize', apply);
    apply();
  }

  // ----- back to top -----
  toTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
