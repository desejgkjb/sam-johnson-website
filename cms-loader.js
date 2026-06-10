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
      var st = 'width:100%;display:block;border-radius:6px'
        + ';aspect-ratio:' + aspect
        + ';object-fit:' + (s.fit || 'cover')
        + ';object-position:' + (s.position || 'center');
      return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" style="' + st + '">';
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

    // Portrait photos (about page & homepage teaser) with shape / fit / crop focus
    document.querySelectorAll('[data-cms-portrait]').forEach(function (el) {
      var path = el.dataset.cmsPortrait;
      var src = get(data, path);
      if (src) {
        var parent = get(data, path.split('.').slice(0, -1).join('.')) || {};
        var st = 'width:100%;display:block;border-radius:8px'
          + ';aspect-ratio:' + (parent.portrait_aspect || '4/5')
          + ';object-fit:' + (parent.portrait_fit || 'cover')
          + ';object-position:' + (parent.portrait_position || 'center');
        el.innerHTML = '<img src="' + esc(src) + '" alt="Portrait of Sam Johnson" style="' + st + '">';
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
        return '<div class="award"><h3>' + esc(a.title) + '</h3>'
          + '<p class="meta">' + esc(a.description) + '</p></div>';
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
    if (el && data.projects) renderProjectsPage(el, data.projects);

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

  function load() {
    fetch('/_data/content.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { if (data) init(data); })
      .catch(function () { /* fail silently — static fallback text remains */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
