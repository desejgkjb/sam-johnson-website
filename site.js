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

/* Contact page — site search in the enquiry bar */
(function () {
  const input = document.getElementById('enquiryInput');
  const panel = document.getElementById('searchResults');
  const bar = document.getElementById('enquiryBar');
  if (!input || !panel || !bar) return;

  let index = [];

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildIndex(d) {
    const ix = [];
    (d.news || []).forEach(n => ix.push({ type: 'News', title: n.title, text: [n.summary, n.source, n.date].join(' '), meta: [n.source, n.date].filter(Boolean).join(' · '), url: n.url, external: true }));
    (d.faqs || []).forEach(f => ix.push({ type: 'FAQ', title: f.question, text: f.answer, answer: f.answer }));
    (d.projects || []).forEach(p => ix.push({ type: 'Project', title: p.title, text: [p.description, p.meta, p.chip].join(' '), meta: p.meta, url: 'projects.html' }));
    (d.governance || []).forEach(g => ix.push({ type: 'Governance', title: g.title, text: [g.description, g.meta, g.chip].join(' '), meta: g.meta, url: 'projects.html' }));
    (d.timeline || []).forEach(t => ix.push({ type: 'Experience', title: t.title, text: [t.description, t.year, t.location].join(' '), meta: t.year, url: 'experience.html' }));
    (d.awards || []).forEach(a => ix.push({ type: 'Award', title: a.title, text: [a.description, a.year].join(' '), meta: a.year, url: a.url || 'experience.html', external: !!a.url }));
    (d.recognition || []).forEach(r => ix.push({ type: 'Recognition', title: r.title, text: r.description || '', url: r.url || 'index.html', external: !!r.url }));
    return ix;
  }

  document.addEventListener('cms:data', function () {
    index = buildIndex(window.__cmsData || {});
  });

  function search(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    if (!terms.length) return [];
    return index.map(function (item) {
      const title = (item.title || '').toLowerCase();
      const text = (item.text || '').toLowerCase();
      let score = 0;
      terms.forEach(function (t) {
        if (title.includes(t)) score += 3;
        if (text.includes(t)) score += 1;
      });
      return { item: item, score: score };
    }).filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map(r => r.item);
  }

  function snippet(item, q) {
    const text = item.text || '';
    const t = q.toLowerCase().split(/\s+/).filter(x => x.length > 1)[0] || '';
    const pos = text.toLowerCase().indexOf(t);
    let out = pos > 40 ? '…' + text.slice(pos - 30, pos + 70) : text.slice(0, 100);
    return out.trim() + (text.length > 100 ? '…' : '');
  }

  function render(q) {
    const results = search(q);
    let html = results.map(function (item, i) {
      const head = '<span class="sr-type">' + item.type + '</span>'
        + '<span class="sr-body"><strong>' + esc(item.title) + '</strong>'
        + '<small>' + esc(item.meta || snippet(item, q)) + '</small>'
        + (item.answer ? '<span class="sr-answer">' + esc(item.answer) + '</span>' : '')
        + '</span>';
      if (item.answer) {
        return '<button type="button" class="sr-row sr-faq" data-i="' + i + '">' + head + '</button>';
      }
      return '<a class="sr-row" href="' + esc(item.url) + '"' + (item.external ? ' target="_blank" rel="noopener"' : '') + '>' + head + '</a>';
    }).join('');
    html += '<button type="button" class="sr-row sr-fallback" id="srEnquiry">'
      + '<span class="sr-type sr-type-red">Enquiry</span>'
      + '<span class="sr-body"><strong>Can’t find it? Send us a message</strong>'
      + '<small>We’ll point your question the right way</small></span></button>';
    panel.innerHTML = html;
    panel.hidden = false;
  }

  input.addEventListener('input', function () {
    const q = input.value.trim();
    if (q.length < 2) { panel.hidden = true; return; }
    render(q);
  });

  bar.addEventListener('submit', function () {
    const q = input.value.trim();
    if (q.length >= 2) render(q);
  });

  panel.addEventListener('click', function (e) {
    const faq = e.target.closest('.sr-faq');
    if (faq) { faq.classList.toggle('open'); return; }
    if (e.target.closest('#srEnquiry')) {
      const formSec = document.getElementById('contactForm');
      const msg = document.getElementById('cf-msg');
      if (msg && !msg.value) msg.value = input.value.trim();
      panel.hidden = true;
      if (formSec) formSec.scrollIntoView({ behavior: 'smooth' });
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.enquiry-bar') && !e.target.closest('.search-results')) panel.hidden = true;
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') panel.hidden = true;
  });
})();

/* Contact page — enquiry bar and pathway cards feed the form */
(function () {
  const formSec = document.getElementById('contactForm');
  if (!formSec) return;

  const bar = document.getElementById('enquiryBar');
  if (bar) {
    // The search module renders results on submit; just stop the page reload here.
    bar.addEventListener('submit', function (e) { e.preventDefault(); });
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

/* Awards rail — arrow-driven horizontal scroller */
(function () {
  const track = document.getElementById('cms-awards');
  const prev = document.getElementById('awardsPrev');
  const next = document.getElementById('awardsNext');
  if (!track || !prev || !next) return;

  function step() {
    const c = track.firstElementChild;
    if (!c) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 24;
    return c.getBoundingClientRect().width + gap;
  }
  function update() {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  }
  prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  track.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  new MutationObserver(update).observe(track, { childList: true });
  update();
})();

/* Scroll reveal — elements with [data-reveal] fade and lift in.
   Re-scans after the CMS loader injects content (cms:data event). */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('reveal-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  function scan() {
    document.querySelectorAll('[data-reveal]:not(.reveal-watched)').forEach((el) => {
      el.classList.add('reveal-watched', 'reveal-init');
      io.observe(el);
    });
  }
  scan();
  document.addEventListener('cms:data', scan);
})();

/* Cinematic panels (values + story chapters) — scroll reveal (re-runs after the CMS render) */
(function () {
  const container = document.getElementById('cms-values');
  if (!container && !document.querySelector('.value-panel')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function observe() {
    const panels = document.querySelectorAll('.value-panel:not(.vp-watched)');
    if (!panels.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      panels.forEach(function (p) { p.classList.add('vp-watched', 'vp-in'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('vp-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.18 });
    panels.forEach(function (p) {
      p.classList.add('vp-watched');
      io.observe(p);
    });
  }

  if (container) new MutationObserver(observe).observe(container, { childList: true });
  observe();
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

/* Journey chapters — panel click expands inline chapter view */
(function () {
  var section = document.getElementById('journey-section');
  if (!section) return;
  var panelsWrap = document.getElementById('journey-panels-wrap');
  var chapterWrap = document.getElementById('journey-chapter-wrap');
  if (!panelsWrap || !chapterWrap) return;

  var currentChapter = 0;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function allChapters() {
    return section.querySelectorAll('.journey-chapter');
  }

  function openChapter(n) {
    currentChapter = n;
    if (!reduced) {
      panelsWrap.classList.add('jpw-exiting');
    }
    var delay = reduced ? 0 : 340;
    setTimeout(function () {
      panelsWrap.style.display = 'none';
      panelsWrap.classList.remove('jpw-exiting');
      allChapters().forEach(function (el) {
        el.style.display = 'none';
        el.classList.remove('jc--in', 'jc--out', 'jc--switching-out');
      });
      chapterWrap.style.display = 'block';
      var target = document.getElementById('jc-' + n);
      if (!target) return;
      target.style.display = 'block';
      if (reduced) {
        target.classList.add('jc--in');
      } else {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            target.classList.add('jc--in');
          });
        });
      }
      section.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    }, delay);
  }

  function closeChapters() {
    var active = section.querySelector('.journey-chapter.jc--in');
    if (active) {
      active.classList.remove('jc--in');
      if (!reduced) active.classList.add('jc--out');
    }
    var delay = reduced ? 0 : 300;
    setTimeout(function () {
      chapterWrap.style.display = 'none';
      allChapters().forEach(function (el) {
        el.style.display = 'none';
        el.classList.remove('jc--in', 'jc--out', 'jc--switching-out');
      });
      panelsWrap.style.display = 'block';
      if (!reduced) {
        panelsWrap.style.opacity = '0';
        panelsWrap.style.transform = 'scale(.97)';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            panelsWrap.style.transition = 'opacity .42s ease, transform .42s cubic-bezier(.2,.6,.2,1)';
            panelsWrap.style.opacity = '';
            panelsWrap.style.transform = '';
            setTimeout(function () { panelsWrap.style.transition = ''; }, 450);
          });
        });
      }
      section.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      currentChapter = 0;
    }, delay);
  }

  function switchChapter(n) {
    var from = section.querySelector('.journey-chapter.jc--in');
    if (from) {
      from.classList.remove('jc--in');
      if (!reduced) from.classList.add('jc--switching-out');
    }
    var delay = reduced ? 0 : 290;
    setTimeout(function () {
      if (from) {
        from.style.display = 'none';
        from.classList.remove('jc--switching-out');
      }
      currentChapter = n;
      var to = document.getElementById('jc-' + n);
      if (!to) return;
      to.style.display = 'block';
      if (reduced) {
        to.classList.add('jc--in');
      } else {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { to.classList.add('jc--in'); });
        });
      }
      section.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    }, delay);
  }

  /* Panel clicks */
  section.querySelectorAll('.journey-panel[data-chapter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openChapter(parseInt(this.dataset.chapter, 10));
    });
  });

  /* Back / forward buttons — event delegation inside chapter wrap */
  chapterWrap.addEventListener('click', function (e) {
    if (e.target.closest('.jc-back-btn')) { closeChapters(); return; }
    var nav = e.target.closest('.jc-forward-btn, .jc-prev-btn');
    if (nav && nav.dataset.chapter) {
      switchChapter(parseInt(nav.dataset.chapter, 10));
    }
  });

  /* Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && currentChapter > 0) closeChapters();
  });
})();

/* Endorsement wall — profile row drives the hero quote */
(function () {
  const quote = document.getElementById('endorseQuote');
  const row = document.getElementById('cms-testimonials');
  if (!quote || !row) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Per-testimonial background image — two layers crossfade behind the section */
  const sec = row.closest('.testimonials');
  const bgA = document.getElementById('endorseBgA');
  const bgB = document.getElementById('endorseBgB');
  let bgCurrent = null;
  let frontIsA = false;

  function setBg(url) {
    if (!bgA || !bgB || !sec) return;
    url = url || '';
    if (url === bgCurrent) return;
    bgCurrent = url;
    if (!url) {
      bgA.classList.remove('visible');
      bgB.classList.remove('visible');
      sec.classList.remove('has-bg');
      return;
    }
    const img = new Image();
    img.onload = function () {
      if (bgCurrent !== url) return; // a newer selection superseded this one
      const front = frontIsA ? bgA : bgB;
      const back = frontIsA ? bgB : bgA;
      back.style.backgroundImage = 'url(' + url + ')';
      back.classList.add('visible');
      front.classList.remove('visible');
      frontIsA = !frontIsA;
      sec.classList.add('has-bg');
    };
    img.src = url;
  }

  function activate(btn, instant) {
    row.querySelectorAll('.endorse-profile').forEach(function (b) {
      b.classList.toggle('active', b === btn);
    });
    setBg(btn.dataset.bg);
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
