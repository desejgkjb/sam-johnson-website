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
