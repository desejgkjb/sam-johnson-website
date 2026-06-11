/**
 * CMS Content Loader
 * Fetches /_data/content.json and populates all data-cms-* elements
 * and dynamic list containers (projects, testimonials, timeline, etc.)
 */
(function () {
  'use strict';

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function imgOrPlaceholder(src, alt, s) {
    s = s || {};
    var aspect = s.aspect || '16/10';
    if (src) {
      var st = 'width:100%;height:100%;display:block'
        + ';object-fit:' + (s.fit || 'cover')
        + ';object-position:' + (s.position || 'center');
      return '<div class="img-frame" style="aspect-ratio:' + aspect + '">'
        + '<img src="' + esc(src) + '" alt="' + esc(alt) + '" style="' + st + '"></div>';
    }
    return '<div class="img-placeholder" style="aspect-ratio:' + aspect + ';border-radius:6px" role="img" aria-label="' + esc(alt) + ' — placeholder"><span>' + esc(alt) + '</span></div>';
  }

  function imgSettings(item) {
    return { aspect: item.image_aspect, fit: item.image_fit, position: item.image_position };
  }

  function applyFields(data) {
    // data-cms-field: sets innerHTML (supports plain text and HTML)
    document.querySelectorAll('[data-cms-field]').forEach(function (el) {
      var val = get(data, el.dataset.cmsField);
      if (val !== undefined && val !== null && val !== '') {
        if (el.tagName === 'IMG') {
          el.src = val;
          el.style.display = '';
        } else {
          el.innerHTML = val;
        }
      }
    });

    // data-cms-href: sets href attribute (for URLs)
    document.querySelectorAll('[data-cms-href]').forEach(function (el) {
      var val = get(data, el.dataset.cmsHref);
      if (val) { el.href = val; }
    });

    // data-cms-mailto: sets href to mailto:value AND sets link text to value
    document.querySelectorAll('[data-cms-mailto]').forEach(function (el) {
      var val = get(data, el.getAttribute('data-cms-mailto'));
      if (val) {
        el.href = 'mailto:' + val;
        el.textContent = val;
      }
    });

    // Hero background photo (fit / crop focus / section height from CMS)
    var heroSection = document.querySelector('.hero');
    if (heroSection && data.hero && data.hero.photo) {
      heroSection.style.backgroundImage = 'url(' + data.hero.photo + ')';
      heroSection.style.backgroundSize = data.hero.photo_fit === 'contain' ? 'contain' : 'cover';
      heroSection.style.backgroundPosition = data.hero.photo_position || 'center';
      heroSection.style.backgroundRepeat = 'no-repeat';
      if (data.hero.photo_height) heroSection.style.minHeight = data.hero.photo_height;
      var note = heroSection.querySelector('.hero-photo-note');
      if (note) note.style.display = 'none';
    }

    // Hero background video (photo above remains the fallback/poster)
    if (heroSection && data.hero && data.hero.video) {
      var vid = document.createElement('video');
      vid.className = 'hero-video';
      vid.src = data.hero.video;
      if (data.hero.photo) vid.poster = data.hero.photo;
      var autoplay = data.hero.video_autoplay !== false;
      vid.loop = data.hero.video_loop !== false;
      vid.muted = autoplay ? true : data.hero.video_muted !== false; // autoplay requires mute
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      if (vid.muted) vid.setAttribute('muted', '');
      vid.preload = 'metadata';
      vid.setAttribute('aria-hidden', 'true');
      vid.tabIndex = -1;
      heroSection.prepend(vid);
      var noteV = heroSection.querySelector('.hero-photo-note');
      if (noteV) noteV.style.display = 'none';
      if (autoplay) {
        var p = vid.play();
        if (p && p.catch) p.catch(function () { vid.remove(); }); // photo fallback
      }
    }

    // Portrait photos (about page & homepage teaser) with shape / fit / crop focus
    document.querySelectorAll('[data-cms-portrait]').forEach(function (el) {
      var path = el.dataset.cmsPortrait;
      var src = get(data, path);
      if (src) {
        var parent = get(data, path.split('.').slice(0, -1).join('.')) || {};
        var st = 'width:100%;height:100%;display:block'
          + ';object-fit:' + (parent.portrait_fit || 'cover')
          + ';object-position:' + (parent.portrait_position || 'center');
        el.innerHTML = '<div class="img-frame" style="border-radius:8px;aspect-ratio:' + (parent.portrait_aspect || '4/5') + '">'
          + '<img src="' + esc(src) + '" alt="Portrait of Sam Johnson" style="' + st + '"></div>';
        el.classList.remove('img-placeholder');
        el.style.aspectRatio = 'auto';
        el.style.background = 'none';
      }
    });
  }

  function renderProjects(container, projects) {
    container.innerHTML = projects.slice(0, 3).map(function (p) {
      return '<article class="card">'
        + imgOrPlaceholder(p.image, p.title, imgSettings(p))
        + '<h3>' + esc(p.title) + '</h3>'
        + '<p class="meta">' + esc(p.meta) + '</p>'
        + '<p>' + esc(p.description) + '</p>'
        + '<span class="chip">' + esc(p.chip) + '</span>'
        + '</article>';
    }).join('');
  }

  function renderProjectsPage(container, projects) {
    projects = sortFeatured(projects);
    container.innerHTML = projects.map(function (p, i) {
      if (i === 0) {
        return '<article class="card featured">'
          + imgOrPlaceholder(p.image, p.title, imgSettings(p))
          + '<div class="card-body">'
          + '<span class="section-label" style="margin-bottom:0">Flagship</span>'
          + '<h3>' + esc(p.title) + '</h3>'
          + '<p class="meta">' + esc(p.meta) + '</p>'
          + '<p>' + esc(p.description) + '</p>'
          + '<span class="chip">' + esc(p.chip) + '</span>'
          + '</div></article>';
      }
      return '<article class="card">'
        + imgOrPlaceholder(p.image, p.title, imgSettings(p))
        + '<h3>' + esc(p.title) + '</h3>'
        + '<p class="meta">' + esc(p.meta) + '</p>'
        + '<p>' + esc(p.description) + '</p>'
        + '<span class="chip">' + esc(p.chip) + '</span>'
        + '</article>';
    }).join('');
  }

  // Featured items float to the top (stable — CMS order kept within each group)
  function sortFeatured(items) {
    return items.slice().sort(function (a, b) {
      return (b.featured === true) - (a.featured === true);
    });
  }

  // Show the first `count` cards; tuck the rest behind a "View all" button
  function applyShowMore(container, count, labelAll) {
    var old = container.parentNode.querySelector('.section-more');
    if (old) old.remove();
    var cards = Array.prototype.slice.call(container.children);
    var extra = cards.slice(count);
    if (!extra.length) return;
    extra.forEach(function (c) { c.classList.add('extra-hidden'); });

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'section-more';
    var expanded = false;
    function setLabel() {
      btn.innerHTML = expanded
        ? 'Show less'
        : labelAll + ' (' + extra.length + ' more) <span aria-hidden="true">&nbsp;→</span>';
      btn.setAttribute('aria-expanded', expanded);
    }
    setLabel();
    btn.addEventListener('click', function () {
      expanded = !expanded;
      extra.forEach(function (c) {
        c.classList.toggle('extra-hidden', !expanded);
        if (expanded) c.classList.add('extra-revealed');
      });
      setLabel();
      if (!expanded) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    container.insertAdjacentElement('afterend', btn);
  }

  function renderRecognition(container, items) {
    container.innerHTML = items.map(function (r) {
      var inner = (r.logo
          ? '<img class="badge-logo" src="' + esc(r.logo) + '" alt="' + esc(r.title) + ' logo">'
          : '<i aria-hidden="true"></i>')
        + '<span class="badge-text"><strong>' + esc(r.title) + '</strong>'
        + (r.description ? '<small>' + esc(r.description) + '</small>' : '')
        + '</span>';
      return r.url
        ? '<a class="badge" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
        : '<span class="badge">' + inner + '</span>';
    }).join('');
  }

  function renderPress(container, items) {
    container.innerHTML = items.map(function (p) {
      var h = parseInt(p.logo_height, 10) || 36;
      var inner = p.logo
        ? '<img src="' + esc(p.logo) + '" alt="' + esc(p.name) + '" style="height:' + h + 'px">'
          + (p.show_name ? '<span>' + esc(p.name) + '</span>' : '')
        : '<span>' + esc(p.name) + '</span>';
      return p.url
        ? '<a class="press-item" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
        : '<span class="press-item">' + inner + '</span>';
    }).join('');
  }

  function renderGovernance(container, entries) {
    entries = sortFeatured(entries);
    container.innerHTML = entries.map(function (g) {
      return '<article class="card">'
        + (g.image ? imgOrPlaceholder(g.image, g.title, imgSettings(g)) : '')
        + '<h3>' + esc(g.title) + '</h3>'
        + '<p class="meta">' + esc(g.meta) + '</p>'
        + '<p>' + esc(g.description) + '</p>'
        + (g.chip ? '<span class="chip">' + esc(g.chip) + '</span>' : '')
        + '</article>';
    }).join('');
  }

  function renderTestimonials(container, testimonials) {
    container.innerHTML = testimonials.map(function (t) {
      return '<div class="testimonial">'
        + '<blockquote>' + esc(t.quote) + '</blockquote>'
        + '<cite><strong>' + esc(t.author) + '</strong>' + esc(t.title) + '</cite>'
        + '</div>';
    }).join('');
  }

  function renderTimeline(container, items) {
    container.innerHTML = '<ol class="timeline-list">'
      + items.map(function (item) {
        return '<li class="timeline-item">'
          + '<span class="timeline-year">' + esc(item.year) + '</span>'
          + '<span class="timeline-dot" aria-hidden="true"></span>'
          + '<div class="timeline-card">'
          + '<h3>' + esc(item.title)
          + (item.location ? '<span class="loc-chip">' + esc(item.location) + '</span>' : '')
          + '</h3>'
          + '<p>' + esc(item.description) + '</p>'
          + (item.chip ? '<span class="chip">' + esc(item.chip) + '</span>' : '')
          + '</div></li>';
      }).join('')
      + '</ol>';
  }

  function renderStats(container, stats) {
    container.innerHTML = stats.map(function (s) {
      return '<div><span class="stat-num">' + esc(s.number) + '</span>'
        + '<span class="stat-label">' + esc(s.label) + '</span></div>';
    }).join('');
  }

  function renderAwards(container, awards) {
    container.innerHTML = '<div class="awards-grid">'
      + awards.map(function (a) {
        var size = parseInt(a.logo_size, 10) || 56;
        var logo = a.logo
          ? '<div class="award-logo" style="height:' + size + 'px"><img src="' + esc(a.logo) + '" alt="' + esc(a.title) + ' logo"></div>'
          : '<div class="award-logo award-logo-empty" aria-hidden="true"><span></span></div>';
        var inner = logo
          + '<h3>' + esc(a.title) + '</h3>'
          + '<p class="award-desc">' + esc(a.description) + '</p>'
          + (a.year ? '<p class="award-year">' + esc(a.year) + '</p>' : '')
          + (a.url ? '<span class="award-link">Learn more →</span>' : '');
        return a.url
          ? '<a class="award" href="' + esc(a.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
          : '<div class="award">' + inner + '</div>';
      }).join('')
      + '</div>';
  }

  function renderValues(container, values) {
    container.innerHTML = values.map(function (v) {
      return '<div class="value-card">'
        + '<i aria-hidden="true"></i>'
        + '<h3>' + esc(v.title) + '</h3>'
        + '<p>' + esc(v.body) + '</p>'
        + '</div>';
    }).join('');
  }

  function renderSpeakingTopics(container, topics) {
    container.innerHTML = topics.map(function (t) {
      return '<span class="chip">' + esc(t) + '</span>';
    }).join('');
  }

  function init(data) {
    applyFields(data);

    var el;

    el = document.getElementById('cms-projects');
    if (el && data.projects) renderProjects(el, data.projects);

    el = document.getElementById('cms-projects-page');
    if (el && data.projects) {
      renderProjectsPage(el, data.projects);
      applyShowMore(el, 5, 'View all projects');
    }

    el = document.getElementById('cms-awards-strip');
    if (el && data.recognition && data.recognition.length) renderRecognition(el, data.recognition);

    el = document.getElementById('cms-press');
    if (el && data.press && data.press.length) renderPress(el, data.press);

    el = document.getElementById('cms-governance');
    if (el && data.governance) {
      renderGovernance(el, data.governance);
      applyShowMore(el, 4, 'View all governance');
    }

    el = document.getElementById('cms-testimonials');
    if (el && data.testimonials) renderTestimonials(el, data.testimonials);

    el = document.getElementById('cms-timeline');
    if (el && data.timeline) renderTimeline(el, data.timeline);

    el = document.getElementById('cms-stats');
    if (el && data.stats) renderStats(el, data.stats);

    el = document.getElementById('cms-awards');
    if (el && data.awards) renderAwards(el, data.awards);

    el = document.getElementById('cms-values');
    if (el && data.pages && data.pages.about && data.pages.about.values) {
      renderValues(el, data.pages.about.values);
    }

    el = document.getElementById('cms-speaking-topics');
    if (el && data.pages && data.pages.home && data.pages.home.speaking_topics) {
      renderSpeakingTopics(el, data.pages.home.speaking_topics);
    }

  }

  // Content is split into one file per CMS section (matches the admin sidebar).
  // Each file's "copy" key maps to pages.<page>; everything else merges top-level.
  var SOURCES = [
    { file: '/_data/settings.json' },
    { file: '/_data/home.json', page: 'home' },
    { file: '/_data/about.json', page: 'about' },
    { file: '/_data/governance-projects.json', page: 'projects' },
    { file: '/_data/experience.json', page: 'experience' },
    { file: '/_data/contact.json', page: 'contact' },
    { file: '/_data/testimonials.json' }
  ];

  function load() {
    Promise.all(SOURCES.map(function (s) {
      return fetch(s.file)
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    })).then(function (parts) {
      var data = { pages: {} };
      var loaded = false;
      parts.forEach(function (p, i) {
        if (!p) return;
        loaded = true;
        Object.keys(p).forEach(function (k) {
          if (k === 'copy' && SOURCES[i].page) {
            data.pages[SOURCES[i].page] = p.copy;
          } else {
            data[k] = p[k];
          }
        });
      });
      if (loaded) init(data);
    }).catch(function () { /* fail silently — static fallback text remains */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
