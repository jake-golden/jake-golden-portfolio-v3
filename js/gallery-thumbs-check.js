(function () {
  // Optional runtime checker: add ?checkThumbs=1 to the page URL to verify that thumbnail
  // variants exist for each gallery item. Logs warnings to the console for any missing
  // files. This performs lightweight HEAD requests.

  if (!/\bcheckThumbs=1\b/.test(location.search)) return;

  const WIDTHS = [800, 1200, 1600];
  const FORMATS = ['avif', 'webp', 'jpg'];

  function splitPath(fullPath) {
    const parts = fullPath.split('/');
    const file = parts.pop();
    const m = file.match(/^(.*)\.(jpe?g)$/i);
    if (!m) return null;
    return { dir: parts.join('/'), base: m[1], ext: m[2].toLowerCase() };
  }

  function buildThumbDir(original) {
    const info = splitPath(original);
    if (!info) return null;
    const folder = `${info.base}-thumb.${info.ext}`;
    return `${info.dir}/${folder}`;
  }

  async function urlExists(url) {
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function checkOriginal(original) {
    if (!original) return;
    const thumbDir = buildThumbDir(original);
    if (!thumbDir) return;

    const missing = [];
    for (const w of WIDTHS) {
      for (const fmt of FORMATS) {
        const url = `${thumbDir}/${w}w.${fmt}`
          .split('/')
          .map(encodeURIComponent)
          .join('/');
        // Restore slashes between encoded segments
        const fixed = url.replace(/%2F/g, '/');
        // HEAD check
        /* eslint-disable no-await-in-loop */
        const ok = await urlExists(fixed);
        if (!ok) missing.push(fixed);
      }
    }
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.warn(`[thumb-check] Missing variants for`, original, '\n', missing.join('\n'));
    }
  }

  async function run() {
    // Prefer data-full on each gallery item; fall back to any child img/picture sources
    const items = Array.from(document.querySelectorAll('#gallery .gallery-item'));
    for (const item of items) {
      let original = item.getAttribute('data-full') || '';
      if (!original) {
        const img = item.querySelector('img');
        original = img?.getAttribute('data-src') || img?.getAttribute('src') || '';
      }
      // eslint-disable-next-line no-await-in-loop
      await checkOriginal(original);
    }
    // eslint-disable-next-line no-console
    console.info(`[thumb-check] Completed check for ${items.length} image(s).`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
