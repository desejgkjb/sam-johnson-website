/**
 * CMS Content Loader
 * Fetches /_data/content.json and populates all data-cms-field elements
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

  function imgOrPlaceholder(src, alt, cls) {
    if (src) {
      return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" class="' + (cls || 'card-img') + '">';
    }
    return '<div class="img-placeholder" role="img" aria-label="' + esc(alt) + ' — placeholder"><span>' + esc(alt) + '</span></div>';
  }

  function applyFields(data) {
    // Simple text/html fields
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

    // Hero background photo
    var heroSection = document.querySelector('.hero');
    if (heroSection && data.hero && data.hero.photo) {
      heroSection.style.backgroundImage = 'url(' + data.hero.photo + ')';
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
      var note = heroSection.querySelector('.hero-photo-note');
      if (note) note.style.display = 'none';
    }

    // Portrait photos (about page & homepage teaser)
    var portraits = document.querySelectorAll('[data-cms-portrait]');
    portraits.forEach(function (el) {
      var key = el.dataset.cmsPortrait;
      var src = get(data, key);
      if (src) {
        el.innerHTML = '<img src="' + esc(src) + '" alt="Portrait of Sam Johnson" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">';
        el.classList.remove('img-placeholder');
      }
    });
  }

  function renderProjects(container, projects) {
    // Homepage: first 3 projects
    container.innerHTML = projects.slice(0, 3).map(function (p) {
      return '<article class="card">'
        + imgOrPlaceholder(p.image, p.title)
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
          + imgOrPlaceholder(p.image, p.title)
          + '<div class="card-body">'
          + '<span class="section-label" style="margin-bottom:0">Flagship</span>'
          + '<h3>' + esc(p.title) + '</h3>'
          + '<p class="meta">' + esc(p.meta) + '</p>'
          + '<p>' + esc(p.description) + '</p>'
          + '<span class="chip">' + esc(p.chip) + '</span>'
          + '</div></article>';
      }
      return '<article class="card">'
        + imgOrPlaceholder(p.image, p.title)
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
