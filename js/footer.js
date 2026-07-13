(function () {
  var footerHTML = '<footer>&copy; 2025 Jake Golden. All rights reserved.</footer>';
  var placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.outerHTML = footerHTML;
  }
})();
