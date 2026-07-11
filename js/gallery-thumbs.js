(function () {
  // Auto-upgrade concise <img class="auto-thumb"> into <picture> with AVIF/WebP/JPEG srcset
  // using the per-image thumbnail folder structure: <name>-thumb.<ext>/{800w,1200w,1600w}.<format>

  const WIDTHS = [800, 1200, 1600];
  const SIZES = '(min-width: 1400px) 420px, (min-width: 992px) 360px, (min-width: 576px) 300px, 240px';

  function encodePath(p) {
    // Safely encode each path segment to handle spaces and parentheses
    return p.split('/').map(encodeURIComponent).join('/');
  }

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

  function buildPicture(img) {
    const original = img.getAttribute('data-src') || img.getAttribute('src');
    if (!original) return null;
    const alt = img.getAttribute('alt') || '';
    const loading = img.getAttribute('loading') || 'lazy';
    const decoding = img.getAttribute('decoding') || 'async';

    const thumbDir = buildThumbDir(original);
    if (!thumbDir) return null;

    // Build srcset strings
    const avif = WIDTHS.map(w => `${encodePath(`${thumbDir}/${w}w.avif`)} ${w}w`).join(', ');
    const webp = WIDTHS.map(w => `${encodePath(`${thumbDir}/${w}w.webp`)} ${w}w`).join(', ');
    const jpg  = WIDTHS.map(w => `${encodePath(`${thumbDir}/${w}w.jpg`)} ${w}w`).join(', ');

    const picture = document.createElement('picture');

    const s1 = document.createElement('source');
    s1.type = 'image/avif';
    s1.setAttribute('srcset', avif);
    picture.appendChild(s1);

    const s2 = document.createElement('source');
    s2.type = 'image/webp';
    s2.setAttribute('srcset', webp);
    picture.appendChild(s2);

    const fallback = document.createElement('img');
    fallback.setAttribute('src', original);
    fallback.setAttribute('srcset', jpg);
    fallback.setAttribute('sizes', SIZES);
    fallback.setAttribute('alt', alt);
    fallback.setAttribute('loading', loading);
    fallback.setAttribute('decoding', decoding);

    picture.appendChild(fallback);
    return picture;
  }

  function upgradeAll() {
    const candidates = Array.from(document.querySelectorAll('.gallery-item .frame img.auto-thumb'));
    for (const img of candidates) {
      if (img.closest('picture')) continue; // already upgraded
      const frame = img.parentElement;
      const pic = buildPicture(img);
      if (!pic) continue;
      frame.replaceChild(pic, img);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', upgradeAll);
  } else {
    upgradeAll();
  }
})();
