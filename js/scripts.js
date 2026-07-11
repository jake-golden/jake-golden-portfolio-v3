// ==========================
// Section Toggles (slide open/close)
// ==========================
document.querySelectorAll(".banner").forEach(banner => {
  banner.addEventListener("click", () => {
    const target = document.getElementById(banner.dataset.target);
    if (target) {
      const willOpen = !target.classList.contains("open");
      target.classList.toggle("open");
      if (willOpen) {
        banner.classList.add("expanded");
      } else {
        banner.classList.remove("expanded");
      }
    }
  });
});

// ==========================
// Expandable Cards (click to reveal more content)
// ==========================
document.querySelectorAll(".expandable-card").forEach(card => {
  card.addEventListener("click", function(e) {
    const content = card.querySelector(".expandable-content");
    if (!content) return;

    const isOpen = card.classList.contains("open");

    if (!isOpen) {
      content.style.display = "block";
      card.classList.add("open");
      return;
    }

    const clickedInsideContent = e.target.closest('.expandable-content');
    if (!clickedInsideContent) {
      content.style.display = "none";
      card.classList.remove("open");
    }
  });
});

// ==========================
// Projects: Hover video play/pause on project cards
// ==========================
(function() {
  function bindProjectCardHover() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;
    cards.forEach(card => {
      if (card.dataset.hoverBound === '1') return;
      card.dataset.hoverBound = '1';
      card.addEventListener('mouseenter', function() {
        const video = card.querySelector('.project-video');
        if (video && typeof video.play === 'function') {
          try { video.play(); } catch(_) {}
        }
      });
      card.addEventListener('mouseleave', function() {
        const video = card.querySelector('.project-video');
        if (video) {
          try { video.pause(); } catch(_) {}
          try { video.currentTime = 0; } catch(_) {}
        }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindProjectCardHover);
  } else {
    bindProjectCardHover();
  }
})();

// ==========================
// Engineering filters (All / Project / Internship)
// Reads data-categories (set by engineering-grid.js from projects-data.js),
// not a hand-typed freeform tag string — no typo-driven filter bugs possible.
// ==========================
(function() {
  function bindEngineeringFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    if (!buttons.length) return;
    const items = Array.from(document.querySelectorAll('.engineering-item'));
    const container = document.querySelector('.row.g-3.justify-content-center');

    function shouldShowFor(col, filter) {
      if (filter === 'all') return true;
      const a = col.querySelector('a[data-categories]');
      if (!a) return true;
      const categories = (a.getAttribute('data-categories') || '').split(',');
      return categories.indexOf(filter) !== -1;
    }

    function applyFilter(filter) {
      if (!container) return;

      const preRects = new Map();
      items.forEach(el => {
        if (!el.classList.contains('d-none')) {
          preRects.set(el, el.getBoundingClientRect());
        }
      });

      const toShow = [];
      const toHide = [];
      items.forEach(el => {
        const visible = !el.classList.contains('d-none');
        const show = shouldShowFor(el, filter);
        if (show && !visible) toShow.push(el);
        if (!show && visible) toHide.push(el);
      });

      toShow.forEach(el => {
        el.classList.remove('d-none');
        el.classList.add('eng-appear');
      });
      toHide.forEach(el => {
        el.classList.add('d-none');
      });

      void container.offsetHeight;

      const visibleItems = items.filter(el => !el.classList.contains('d-none'));
      visibleItems.forEach(el => {
        const post = el.getBoundingClientRect();
        const pre = preRects.get(el);
        if (pre) {
          const dx = pre.left - post.left;
          const dy = pre.top - post.top;
          if (dx || dy) {
            el.style.transform = `translate(${dx}px, ${dy}px)`;
          }
        }
        el.classList.add('eng-animating');
      });

      requestAnimationFrame(() => {
        visibleItems.forEach(el => {
          el.style.transition = 'transform 220ms cubic-bezier(0.2, 0.7, 0.2, 1)';
          el.style.transform = '';
        });
        requestAnimationFrame(() => {
          toShow.forEach(el => el.classList.add('eng-appear-active'));
        });
      });

      function onEnd(e) {
        if (e.propertyName !== 'transform') return;
        const el = e.currentTarget;
        el.style.transition = '';
        el.classList.remove('eng-animating');
        el.removeEventListener('transitionend', onEnd);
      }
      visibleItems.forEach(el => el.addEventListener('transitionend', onEnd));

      setTimeout(() => {
        toShow.forEach(el => {
          el.classList.remove('eng-appear');
          el.classList.remove('eng-appear-active');
        });
      }, 260);
    }
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter || 'all');
      });
    });
    applyFilter('all');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEngineeringFilters);
  } else {
    bindEngineeringFilters();
  }
})();
