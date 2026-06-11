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

/* Contact page — enquiry bar and pathway cards feed the form */
(function () {
  const formSec = document.getElementById('contactForm');
  if (!formSec) return;

  const bar = document.getElementById('enquiryBar');
  if (bar) {
    bar.addEventListener('submit', function (e) {
      e.preventDefault();
      const v = document.getElementById('enquiryInput').value.trim();
      const msg = document.getElementById('cf-msg');
      if (v && msg && !msg.value) msg.value = v;
      formSec.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () {
        const target = document.getElementById('cf-name');
        if (target) target.focus({ preventScroll: true });
      }, 650);
    });
  }

  const cats = document.getElementById('cms-contact-categories');
  if (cats) {
    cats.addEventListener('click', function (e) {
      const card = e.target.closest('[data-enquiry]');
      if (!card) return;
      const sel = document.getElementById('cf-type');
      if (sel) {
        const val = card.dataset.enquiry;
        let found = Array.prototype.some.call(sel.options, function (o) { return o.text === val; });
        if (!found) sel.add(new Option(val, val));
        sel.value = val;
      }
      formSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (location.search.indexOf('sent=1') !== -1) {
    const ok = document.getElementById('formSuccess');
    if (ok) {
      ok.hidden = false;
      setTimeout(function () { formSec.scrollIntoView(); }, 100);
    }
  }
})();

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

/* Endorsement wall — profile row drives the hero quote */
(function () {
  const quote = document.getElementById('endorseQuote');
  const row = document.getElementById('cms-testimonials');
  if (!quote || !row) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function activate(btn, instant) {
    row.querySelectorAll('.endorse-profile').forEach(function (b) {
      b.classList.toggle('active', b === btn);
    });
    const text = btn.dataset.quote || '';
    const apply = function () {
      // Show curly quotes unless the quote already includes its own
      quote.textContent = /^["“]/.test(text.trim()) ? text : '“' + text + '”';
      quote.classList.remove('quote-fade');
    };
    if (instant || reduced) { apply(); return; }
    quote.classList.add('quote-fade');
    setTimeout(apply, 260);
  }

  row.addEventListener('click', function (e) {
    const btn = e.target.closest('.endorse-profile');
    if (btn && !btn.classList.contains('active')) activate(btn);
  });

  function initFirst() {
    const first = row.querySelector('.endorse-profile');
    if (first) activate(first, true);
  }

  // Re-initialise when the CMS loader replaces the profiles
  new MutationObserver(initFirst).observe(row, { childList: true });
  initFirst();
})();
