/* Team filter, unchanged */
document.querySelectorAll('.team-filters button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const f=btn.dataset.filter;
    document.querySelectorAll('.cards .card').forEach(c=>{
      c.style.display=(f==='all'||c.classList.contains(f))?'':'none';
    });
  });
});

/* Unified mobile nav controller */
(function(){
  const btn  = document.querySelector('.menu-toggle');
  const nav  = document.querySelector('.nav');
  const xBtn = document.querySelector('.nav-close');
  const logo = document.querySelector('.nav-logo-link');

  if(!btn || !nav) return;

  function openMenu(){
    nav.classList.add('open');
    btn.classList.add('is-active');
    btn.setAttribute('aria-expanded','true');
    document.body.classList.add('noscroll');
  }
  function closeMenu(){
    nav.classList.remove('open');
    btn.classList.remove('is-active');
    btn.setAttribute('aria-expanded','false');
    document.body.classList.remove('noscroll');
  }

  // Toggle on hamburger
  btn.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    if(nav.classList.contains('open')) closeMenu(); else openMenu();
  });

  // Close on X
  if(xBtn){
    xBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  // Close when tapping any nav link
  nav.querySelectorAll('ul li a').forEach(a=>{
    a.addEventListener('click', closeMenu);
  });

  // Logo inside overlay returns home and closes
  if(logo){
    logo.addEventListener('click', function(e){
      // allow navigation but close first for better feel
      closeMenu();
      // if link has href, browser will navigate naturally
    });
  }

  // Active link highlight by *path*, so clean URLs like /services/ work
  function normalizePath(p){
    if(!p) return '/';
    // strip query/hash
    p = p.split('#')[0].split('?')[0];
    // ensure leading slash
    if(p[0] !== '/') p = '/' + p;
    // collapse multiple slashes
    p = p.replace(/\/+/g,'/');
    // treat /index.html as /
    if(p.toLowerCase().endsWith('/index.html')) p = p.slice(0, -'/index.html'.length) + '/';
    // ensure trailing slash for non-file paths
    const looksLikeFile = /\.[a-z0-9]+$/i.test(p);
    if(!looksLikeFile && !p.endsWith('/')) p += '/';
    return p.toLowerCase();
  }

  const currentPath = normalizePath(window.location.pathname || '/');
  nav.querySelectorAll('ul li a').forEach(a=>{
    const href = a.getAttribute('href') || '';
    // Ignore placeholder links (eg Shielded modal trigger)
    if(href === '#') return;
    const targetPath = normalizePath(href);
    if(targetPath === currentPath){
      a.classList.add('active');
    }
  });
})();

// Page fade-in on load
document.addEventListener('DOMContentLoaded', function(){
  document.body.classList.add('is-ready');
});

(function () {
  window.addEventListener('load', function () {
    var shield = new ds07o6pcmkorn({
      openElementId: "#shielded-logo",
      modalID: "modal"
    });
    shield.init();
  });
})();

// Clean URL + GitHub Pages base-aware: fix Home links and active nav state
document.addEventListener('DOMContentLoaded', function () {
  function getSiteBase(){
    var base = '/';
    try{
      var host = (window.location.hostname || '').toLowerCase();
      var path = window.location.pathname || '/';
      if (host.endsWith('github.io')) {
        var seg = path.split('/').filter(Boolean);
        if (seg.length > 0) base = '/' + seg[0] + '/';
      }
    } catch(e){}
    return base;
  }

  function normalizePath(p){
    if(!p) return '/';
    p = p.split('?')[0].split('#')[0];
    p = p.replace(/\/+/g,'/');
    p = p.replace(/\/index\.html$/i,'/');
    if(!p.startsWith('/')) p = '/' + p;
    if(!/\.[a-z0-9]+$/i.test(p) && !p.endsWith('/')) p += '/';
    return p;
  }

  var base = getSiteBase();
  var current = normalizePath(window.location.pathname);

  // Strip base for comparison so "/REPO/services/" matches "/services/"
  var currentLocal = current;
  if (base !== '/' && currentLocal.startsWith(base)) currentLocal = '/' + currentLocal.slice(base.length);

  var currentSeg = (currentLocal.split('/').filter(Boolean)[0] || '').toLowerCase(); // '' for home

  // Route-to-nav mapping for sections that should highlight a different nav item
  var routeMap = {
    'legal-aid-eligibility': 'fees',
    'profiles': 'team'
  };
  var effectiveSeg = routeMap[currentSeg] || currentSeg;

  // Fix any lingering index links (logo/home) to point to base root
  document.querySelectorAll('a[href]').forEach(function(a){
    var href = (a.getAttribute('href') || '').trim();
    if (!href) return;
    if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

    var p = '';
    try { p = new URL(href, window.location.href).pathname; } catch(e){ p = href; }
    p = (p || '').toString();

    if (/(^|\/)index(\.html?)?\/?$/i.test(p) || p === '/') {
      a.setAttribute('href', base);
    }
  });

  // Apply active class on navbar links by first segment match
  var nav = document.querySelector('nav.nav') || document.querySelector('nav') || document.querySelector('.nav');
  if (!nav) return;

  nav.querySelectorAll('a[href]').forEach(function(a){
    var href = (a.getAttribute('href') || '').trim();
    if (!href) return;
    if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

    var p = '';
    try { p = new URL(href, window.location.href).pathname; } catch(e){ p = href; }
    p = normalizePath(p);

    var pLocal = p;
    if (base !== '/' && pLocal.startsWith(base)) pLocal = '/' + pLocal.slice(base.length);

    var seg = (pLocal.split('/').filter(Boolean)[0] || '').toLowerCase();
    var isActive = (seg === currentSeg);

    // Home special-case
    if (currentSeg === '' && seg === '') isActive = true;

    a.classList.toggle('active', isActive);
    var li = a.closest('li');
    if (li) li.classList.toggle('active', isActive);
  });
});

// Clean URLs on GitHub Pages project sites: base-prefixed nav links + mapped active state
document.addEventListener('DOMContentLoaded', function () {
  function getSiteBase(){
    var base = '/';
    try{
      var host = (window.location.hostname || '').toLowerCase();
      var path = window.location.pathname || '/';
      // GitHub Pages project site: https://user.github.io/repo/...
      if (host.endsWith('github.io')){
        var seg = path.split('/').filter(Boolean);
        if (seg.length > 0) base = '/' + seg[0] + '/';
      }
    } catch(e){}
    return base;
  }

  function normPath(p){
    if(!p) return '/';
    p = p.split('?')[0].split('#')[0];
    p = p.replace(/\/+/g,'/');
    p = p.replace(/\/index\.html$/i,'/');
    if(!p.startsWith('/')) p = '/' + p;
    if(!/\.[a-z0-9]+$/i.test(p) && !p.endsWith('/')) p += '/';
    return p;
  }

  var base = getSiteBase(); // "/" or "/WebsiteUpdate/"

  // Build current local path (strip base)
  var current = normPath(window.location.pathname);
  var currentLocal = current;
  if (base !== '/' && currentLocal.startsWith(base)) currentLocal = '/' + currentLocal.slice(base.length);
  var segs = currentLocal.split('/').filter(Boolean);
  var currentSeg = (segs[0] || '').toLowerCase(); // '' for home

  var routeMap = {
    'legal-aid-eligibility': 'fees',
    'profiles': 'team'
  };
  var effectiveSeg = routeMap[currentSeg] || currentSeg;

  // Rewrite navbar links to include base prefix (fixes bossmannz.github.io/services/ 404)
  // We only touch obvious internal route links.
  var nav = document.querySelector('nav.nav') || document.querySelector('nav') || document.querySelector('.nav');
  if (nav){
    nav.querySelectorAll('a[href]').forEach(function(a){
      var href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      // Resolve pathname from href
      var p = '';
      try { p = new URL(href, window.location.href).pathname; } catch(e){ p = href; }
      p = normPath(p);

      // Strip base if present to identify route segment cleanly
      var pLocal = p;
      if (base !== '/' && pLocal.startsWith(base)) pLocal = '/' + pLocal.slice(base.length);
      var parts = pLocal.split('/').filter(Boolean);
      var route = (parts[0] || '').toLowerCase(); // '' for home

      // Home links: force to base root (no /index)
      if (route === '' || /(^|\/)index(\.html?)?\/?$/i.test(pLocal)){
        a.setAttribute('href', base);
        return;
      }

      // For nav items, always use base + route + '/'
      a.setAttribute('href', base + route + '/');
    });

    // Apply active class after rewriting
    nav.querySelectorAll('a[href]').forEach(function(a){
      var href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      var p = '';
      try { p = new URL(href, window.location.href).pathname; } catch(e){ p = href; }
      p = normPath(p);

      var pLocal = p;
      if (base !== '/' && pLocal.startsWith(base)) pLocal = '/' + pLocal.slice(base.length);
      var parts = pLocal.split('/').filter(Boolean);
      var linkSeg = (parts[0] || '').toLowerCase();

      var isActive = (linkSeg === effectiveSeg) || (effectiveSeg === '' && linkSeg === '');
      a.classList.toggle('active', isActive);
      var li = a.closest('li');
      if (li) li.classList.toggle('active', isActive);
    });
  }

  // Also fix ANY logo/home link outside nav that points to /index
  document.querySelectorAll('a[href]').forEach(function(a){
    var href = (a.getAttribute('href') || '').trim();
    if (!href) return;
    if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
    var p = '';
    try { p = new URL(href, window.location.href).pathname; } catch(e){ p = href; }
    p = (p || '').toString();
    if (/(^|\/)index(\.html?)?\/?$/i.test(p) || p === '/'){
      a.setAttribute('href', base);
    }
  });
});


// Team page: preload all portraits before showing grid
document.addEventListener('DOMContentLoaded', function () {
  // Only run on the Team page
  if (!document.body.classList.contains('page-team')) return;

  var grid = document.querySelector('.people-grid');
  if (!grid) return;

  // Mark loading state immediately
  document.body.classList.remove('team-ready');

  // Collect all portrait image URLs (normal + fun)
  var imgs = Array.prototype.slice.call(grid.querySelectorAll('img[src]'));
  var urls = imgs.map(function(img){ return img.getAttribute('src'); }).filter(Boolean);

  // Force eager loading so "loading=lazy" does not prevent completion
  imgs.forEach(function(img){
    try { img.loading = 'eager'; } catch(e){}
    img.removeAttribute('loading');
  });

  // Preload all URLs
  var remaining = urls.length;
  if (remaining === 0){
    document.body.classList.add('team-ready');
    return;
  }

  function done(){
    remaining--;
    if (remaining <= 0){
      document.body.classList.add('team-ready');
    }
  }

  urls.forEach(function(url){
    var im = new Image();
    im.onload = done;
    im.onerror = done;
    // Preserve relative paths
    im.src = url;
  });
});

/* =====================================================
   Team page staged batch reveal (wait for both portraits)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  if (!document.body.classList.contains('page-team')) return;

  var grid = document.querySelector('.people-grid');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.person'));
  if (!cards.length) return;

  var queue = [];
  var BATCH_SIZE = 3;   // how many cards appear at once
  var BATCH_DELAY = 120; // ms between waves

  function flush() {
    if (!queue.length) return;
    queue.splice(0, BATCH_SIZE).forEach(function(card){
      card.classList.add('is-visible');
    });
    if (queue.length) {
      setTimeout(flush, BATCH_DELAY);
    }
  }

  function enqueue(card) {
    if (card.classList.contains('is-visible')) return;
    queue.push(card);
    if (queue.length === 1) flush();
  }

  // For each card, wait until ALL images inside that card are loaded/decoded
  cards.forEach(function(card){
    var imgs = Array.prototype.slice.call(card.querySelectorAll('img'));
    if (!imgs.length) {
      enqueue(card);
      return;
    }

    var remaining = imgs.length;

    function oneDone(){
      remaining -= 1;
      if (remaining <= 0) enqueue(card);
    }

    imgs.forEach(function(img){
      function ready(){
        if (img.decode) {
          img.decode().then(oneDone).catch(oneDone);
        } else {
          oneDone();
        }
      }

      if (img.complete && img.naturalWidth > 0) {
        ready();
      } else {
        img.addEventListener('load', ready, { once: true });
        img.addEventListener('error', ready, { once: true });
      }
    });
  });
});
