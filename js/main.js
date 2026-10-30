/* Vista Coffee — site behaviour */
(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/info@vistacoffeerw.com';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function imgTag(name, alt, sizes) {
    return '<img src="images/' + name + '-sm.webp" srcset="images/' + name + '-sm.webp 800w, images/' + name +
      '.webp 1600w" sizes="' + (sizes || '(min-width: 900px) 33vw, 100vw') + '" alt="' + escapeHtml(alt || '') +
      '" loading="lazy" decoding="async">';
  }

  /* ---------- Sticky header shadow ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = $('.menu-toggle');
  var mobileNav = $('#mobile-nav');
  function setMenu(open) {
    if (!toggle || !mobileNav) return;
    mobileNav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(!mobileNav.classList.contains('is-open')); });
  $$('#mobile-nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- Site search ---------- */
  var overlay = $('#search');
  var input = $('#search-input');
  var results = $('#search-results');
  var lastFocus = null;

  function openSearch() {
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
    document.body.classList.add('menu-open');
    input.value = '';
    renderResults('');
    setTimeout(function () { input.focus(); }, 30);
  }
  function closeSearch() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (lastFocus) lastFocus.focus();
  }
  function renderResults(q) {
    var index = window.VISTA_SEARCH || [];
    q = q.trim().toLowerCase();
    var list = index;
    if (q) {
      var words = q.split(/\s+/);
      list = index.map(function (p) {
        var hay = (p.title + ' ' + p.description + ' ' + p.text).toLowerCase();
        var score = 0;
        for (var i = 0; i < words.length; i++) {
          if (hay.indexOf(words[i]) === -1) return null;
          score += (p.title.toLowerCase().indexOf(words[i]) !== -1 ? 5 : 0) + 1;
        }
        return { p: p, score: score };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).map(function (r) { return r.p; });
    }
    if (!list.length) {
      results.innerHTML = '<p class="search-empty">No results for “' + escapeHtml(q) + '”. Try “green coffee”, “export” or “samples”.</p>';
      return;
    }
    results.innerHTML = list.map(function (p) {
      return '<a href="' + p.url + '"><strong>' + escapeHtml(p.title) + '</strong><span>' + escapeHtml(p.description) + '</span></a>';
    }).join('');
  }
  if (overlay) {
    $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', openSearch); });
    $$('[data-search-close]').forEach(function (b) { b.addEventListener('click', closeSearch); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
    input.addEventListener('input', function () { renderResults(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var first = $('a', results); if (first) window.location.href = first.getAttribute('href'); }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (overlay && overlay.classList.contains('is-open')) closeSearch();
    else if (mobileNav && mobileNav.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Scroll reveal ---------- */
  function observeReveal(root) {
    var items = $$('[data-reveal]:not(.is-visible)', root);
    if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
  observeReveal();

  /* ---------- Tabs (Our Coffee) ---------- */
  $$('[data-tabs]').forEach(function (tabs) {
    var buttons = $$('[role="tab"]', tabs);
    function select(btn, focus) {
      buttons.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) btn.focus();
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (dir) { e.preventDefault(); select(buttons[(i + dir + buttons.length) % buttons.length], true); }
      });
    });
    select(buttons[0]);
  });

  /* ---------- Filter button groups ---------- */
  function filterGroup(bar, attr, onChange) {
    var buttons = $$('button', bar);
    function activate(btn) {
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      onChange(btn.getAttribute(attr));
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { activate(b); }); });
    return function (value) {
      var match = buttons.filter(function (b) { return b.getAttribute(attr) === value; })[0];
      if (match) activate(match);
    };
  }

  /* ---------- Product filter ---------- */
  var productBar = $('[data-filter]');
  if (productBar) {
    var cards = $$('[data-filter-grid] [data-category]');
    var setProduct = filterGroup(productBar, 'data-filter-value', function (value) {
      cards.forEach(function (c) {
        var cat = c.getAttribute('data-category');
        // data-filter-only cards (machine types) appear only under their own filter
        c.hidden = value === 'all' ? c.hasAttribute('data-filter-only') : cat !== value;
      });
    });
    function filterFromHash() {
      var hash = window.location.hash.replace('#', '');
      if (hash && $('[data-filter-value="' + hash + '"]', productBar)) {
        setProduct(hash);
        setTimeout(function () { productBar.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90); }, 50);
      }
    }
    filterFromHash();
    window.addEventListener('hashchange', filterFromHash);
  }

  /* ---------- News list ---------- */
  var newsGrid = $('[data-news-grid]');
  var posts = window.VISTA_NEWS || [];
  function formatDate(d) {
    if (!d) return 'Date to be announced';
    var dt = new Date(d + 'T00:00:00');
    return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function newsCard(p) {
    return '<article class="card news-card" data-reveal>' +
      '<a class="card__media" href="article.html?post=' + encodeURIComponent(p.slug) + '" tabindex="-1" aria-hidden="true">' + imgTag(p.image, p.alt) + '</a>' +
      '<div class="card__body">' +
      '<div class="news-meta"><span class="cat">' + escapeHtml(p.category) + '</span><span>' + escapeHtml(formatDate(p.date)) + '</span>' +
      (p.placeholder ? '<span class="placeholder-flag">Placeholder</span>' : '') + '</div>' +
      '<h3><a href="article.html?post=' + encodeURIComponent(p.slug) + '">' + escapeHtml(p.title) + '</a></h3>' +
      '<p>' + escapeHtml(p.excerpt) + '</p>' +
      '<a class="link-more" href="article.html?post=' + encodeURIComponent(p.slug) + '">Read More <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>' +
      '</div></article>';
  }
  if (newsGrid) {
    var renderNews = function (cat) {
      var list = cat === 'all' ? posts : posts.filter(function (p) { return p.category === cat; });
      newsGrid.innerHTML = list.length ? list.map(newsCard).join('') :
        '<p class="news-empty">No posts in this category yet. Check back soon.</p>';
      observeReveal(newsGrid);
    };
    var newsBar = $('[data-news-filter]');
    if (newsBar) filterGroup(newsBar, 'data-cat', renderNews);
    renderNews('all');
    var latest = $('[data-latest-news]');
    if (latest && posts[0]) latest.href = 'article.html?post=' + encodeURIComponent(posts[0].slug);
  }

  /* ---------- Single article ---------- */
  var articleEl = $('[data-article]');
  if (articleEl) {
    var slug = new URLSearchParams(window.location.search).get('post');
    var post = posts.filter(function (p) { return p.slug === slug; })[0];
    if (!post) {
      articleEl.innerHTML = '<p>Sorry, we could not find that article. <a class="link-more" href="news.html">See all news</a></p>';
    } else {
      document.title = post.title + ' | Vista Coffee News';
      $('[data-article-title]').textContent = post.title;
      $('[data-article-meta]').innerHTML = '<span class="cat" style="color:#fff">' + escapeHtml(post.category) + '</span><span>' +
        escapeHtml(formatDate(post.date)) + '</span>' + (post.placeholder ? '<span class="placeholder-flag">Placeholder</span>' : '');
      articleEl.innerHTML = '<div class="article__media">' + imgTag(post.image, post.alt, '(min-width: 800px) 760px, 100vw') + '</div>' +
        '<div class="article__body">' + post.body.map(function (para) { return '<p>' + escapeHtml(para) + '</p>'; }).join('') + '</div>';
    }
  }

  /* ---------- Inquiry form ---------- */
  var form = $('[data-inquiry-form]');
  if (form) {
    var typeSelect = $('#f-type', form);
    var productSelect = $('#f-product', form);
    var status = $('[data-form-status]', form);
    var params = new URLSearchParams(window.location.search);
    var typeMap = { quote: 'Quote Request', samples: 'Sample Request', specs: 'Product Specifications', export: 'Export Quotation', partnership: 'Partnership' };

    if (typeMap[params.get('type')]) typeSelect.value = typeMap[params.get('type')];
    if (params.get('product')) {
      var wanted = params.get('product');
      $$('option', productSelect).forEach(function (o) { if (o.textContent === wanted) productSelect.value = o.value || o.textContent; });
    }
    if (params.get('type') === 'export' && !productSelect.value) productSelect.value = 'Green Coffee Beans';

    $$('[data-set-type]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        typeSelect.value = b.getAttribute('data-set-type');
        typeSelect.focus();
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    var validators = {
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    };
    function validateField(el) {
      var v = el.value.trim();
      var ok = !el.required || v.length > 0;
      if (ok && el.type === 'email' && v) ok = validators.email(v);
      el.closest('.field').classList.toggle('is-invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      return ok;
    }
    $$('[required]', form).forEach(function (el) {
      el.addEventListener('blur', function () { validateField(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-invalid')) validateField(el); });
    });

    function showStatus(kind, html) {
      status.className = 'form-status is-' + kind;
      status.innerHTML = html;
    }
    function mailtoFallback(data) {
      var body = Object.keys(data).filter(function (k) { return k.charAt(0) !== '_'; })
        .map(function (k) { return k + ': ' + data[k]; }).join('\n');
      return 'mailto:info@vistacoffeerw.com?subject=' + encodeURIComponent('Inquiry — ' + data['Inquiry Type']) + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('[required]', form);
      var valid = fields.map(validateField).every(Boolean);
      if (!valid) {
        var firstBad = $('.is-invalid input, .is-invalid select, .is-invalid textarea', form);
        if (firstBad) firstBad.focus();
        showStatus('error', 'Please complete the highlighted fields.');
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._honey) return;
      data._subject = 'Vista Coffee website — ' + data['Inquiry Type'] + ' from ' + data['Full Name'];
      delete data._next;

      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      var label = btn.innerHTML;
      btn.textContent = 'Sending…';

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok || String(res.body.success) === 'false') throw new Error(res.body.message || 'Send failed');
          form.reset();
          showStatus('success', '<strong>Thank you.</strong> Your inquiry has been sent to our sales team. We will reply to you by email.');
        })
        .catch(function () {
          showStatus('error', 'Sorry, your inquiry could not be sent right now. Please <a href="' + mailtoFallback(data) +
            '" style="text-decoration:underline;font-weight:600">email it to info@vistacoffeerw.com</a> instead.');
        })
        .then(function () { btn.disabled = false; btn.innerHTML = label; });
    });
  }

  /* ---------- Newsletter ---------- */
  $$('[data-newsletter]').forEach(function (nf) {
    var msg = nf.parentNode.querySelector('.newsletter-msg');
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = nf.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Please enter a valid email address.'; nf.email.focus(); return; }
      msg.textContent = 'Subscribing…';
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email, _subject: 'Newsletter sign-up — Vista Coffee website', Request: 'Please add me to the Vista Coffee newsletter.' })
      }).then(function (r) { if (!r.ok) throw new Error(); nf.reset(); msg.textContent = 'Thank you for subscribing.'; })
        .catch(function () { msg.textContent = 'Sign-up failed. Please email info@vistacoffeerw.com.'; });
    });
  });
})();
