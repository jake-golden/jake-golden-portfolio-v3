(function () {
  var footerHTML =
    '<footer class="py-4 bg-white mt-auto">' +
      '<div class="container px-5 text-center">' +
        '<small class="text-muted">&copy; 2025 Jake Golden. All rights reserved.</small>' +
      '</div>' +
    '</footer>';
  var placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.outerHTML = footerHTML;
  }
})();
