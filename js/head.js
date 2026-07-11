// Centralized head resources — favicon, fonts, Bootstrap Icons, Bootstrap CSS, site CSS.
// Must be loaded with a plain <script> tag (no defer/async) so it runs synchronously
// during <head> parsing, keeping stylesheets render-blocking and preventing FOUC.
document.write(
  '<link rel="icon" type="image/x-icon" href="assets/favicon.ico">' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">' +
  '<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">' +
  '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">' +
  '<link rel="stylesheet" href="css/styles.css">'
);
