const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
const toggle = document.getElementById('navToggle'), menu = document.getElementById('mobileMenu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

/* Scroll reveal — elements with [data-reveal] fade and lift in */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('reveal-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => {
    el.classList.add('reveal-init');
    io.observe(el);
  });
})();

/* Experience timeline — dots light up and the line fills as you scroll */
(function () {
  const container = document.getElementById('cms-timeline');
  if (!container) return;

  function update() {
    const list = container.querySelector('.timeline-list');
    if (!list) return;
    const items = Array.from(list.querySelectorAll('.timeline-item'));
    if (!items.length) return;

    // The "reading line" sits a little above the middle of the screen
    const marker = window.innerHeight * 0.55;

    let activeIdx = -1;
    items.forEach(function (item, i) {
      if (item.getBoundingClientRect().top < marker) activeIdx = i;
    });
    items.forEach(function (item, i) {
      item.classList.toggle('is-passed', i < activeIdx);
      item.classList.toggle('is-active', i === activeIdx);
    });

    const rect = list.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (marker - rect.top) / rect.height));
    list.style.setProperty('--tl-progress', progress.toFixed(4));
  }

  let tlRaf;
  function queueUpdate() {
    cancelAnimationFrame(tlRaf);
    tlRaf = requestAnimationFrame(update);
  }

  addEventListener('scroll', queueUpdate, { passive: true });
  addEventListener('resize', queueUpdate);
  // Re-run once the CMS loader replaces the timeline content
  new MutationObserver(queueUpdate).observe(container, { childList: true, subtree: true });
  queueUpdate();
})();

/* Testimonials carousel */
(function () {
  const track = document.getElementById('cms-testimonials');
  const prev = document.getElementById('carouselPrev');
  const next = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track || !prev || !next || !dotsWrap) return;

  let dots = [];

  function slides() { return Array.from(track.children); }

  function pageCount() {
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 1) return 1;
    return Math.round(max / pageStep()) + 1;
  }

  function pageStep() {
    const s = slides()[0];
    if (!s) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return s.getBoundingClientRect().width + gap;
  }

  function currentPage() {
    return Math.round(track.scrollLeft / pageStep());
  }

  function buildDots() {
    const n = pageCount();
    dotsWrap.innerHTML = '';
    dots = [];
    for (let i = 0; i < n; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => {
        track.scrollTo({ left: i * pageStep(), behavior: 'smooth' });
      });
      dotsWrap.appendChild(b);
      dots.push(b);
    }
    update();
  }

  function update() {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
    const cur = Math.min(currentPage(), dots.length - 1);
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    slides().forEach((s, i) => s.classList.toggle('is-current', i === cur));
  }

  prev.addEventListener('click', () => track.scrollBy({ left: -pageStep(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: pageStep(), behavior: 'smooth' }));

  let raf;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener('resize', buildDots);

  // Rebuild when the CMS loader replaces the slides
  new MutationObserver(buildDots).observe(track, { childList: true });

  buildDots();
})();
