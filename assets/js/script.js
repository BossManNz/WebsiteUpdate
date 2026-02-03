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

/* =====================================================
   Team page row-synced batch reveal (no loader)
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  if (!document.body.classList.contains('page-team')) return;

  const grid = document.querySelector('.people-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.profile-card, .person-card'));
  if (!cards.length) return;

  // Hide while we orchestrate reveals
  document.body.classList.add('team-reveal-pending');

  const ready = new Array(cards.length).fill(false);
  const BATCH_SIZE = 3;      // wave size
  const MAX_WAIT = 2000;     // fail-safe: do not keep hidden forever

  let next = 0;
  let failSafe = setTimeout(function(){
    // reveal everything if something goes wrong
    cards.forEach(c => c.classList.add('is-visible'));
    document.body.classList.remove('team-reveal-pending');
  }, MAX_WAIT);

  function waitForImage(img){
    return new Promise(function(resolve){
      if (!img) return resolve();
      if (img.complete && img.naturalWidth > 0) {
        if (img.decode) img.decode().then(resolve).catch(resolve);
        else resolve();
        return;
      }
      img.addEventListener('load', function(){
        if (img.decode) img.decode().then(resolve).catch(resolve);
        else resolve();
      }, { once: true });
      img.addEventListener('error', function(){ resolve(); }, { once: true });
    });
  }

  function markReady(i){
    if (ready[i]) return;
    ready[i] = true;
    tryReveal();
  }

  function tryReveal(){
    if (next >= cards.length) {
      clearTimeout(failSafe);
      document.body.classList.remove('team-reveal-pending');
      return;
    }
    const end = Math.min(next + BATCH_SIZE, cards.length);
    for (let i = next; i < end; i++){
      if (!ready[i]) return;
    }
    // reveal batch together
    for (let i = next; i < end; i++){
      cards[i].classList.add('is-visible');
    }
    next = end;

    // Once first batch is visible, allow rest of page to behave normally
    if (next > 0) {
      document.body.classList.remove('team-reveal-pending');
    }

    // cascade to next batch
    tryReveal();
  }

  cards.forEach(function(card, idx){
    const imgs = Array.from(card.querySelectorAll('img'));
    if (!imgs.length) { markReady(idx); return; }
    Promise.all(imgs.map(waitForImage)).then(function(){ markReady(idx); });
  });
});

/* =====================================================
   Team page reveal by layout rows (no loader)
   - Cards start at opacity 0 but still occupy layout
   - We group cards by their offsetTop (actual row)
   - Reveal the first row only when all images in that row are ready, then next row, etc
   - Fail-safe: reveal everything after MAX_WAIT
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  if (!document.body.classList.contains('page-team')) return;

  const grid = document.querySelector('.people-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.profile-card, .person-card'));
  if (!cards.length) return;

  // Build rows from current layout
  const rows = [];
  const rowMap = new Map(); // key -> array of card indexes

  cards.forEach((card, idx) => {
    const top = Math.round(card.getBoundingClientRect().top); // stable enough for grouping
    // Find an existing row key within small tolerance (layout rounding)
    let key = null;
    for (const k of rowMap.keys()) {
      if (Math.abs(k - top) <= 4) { key = k; break; }
    }
    if (key === null) key = top;
    if (!rowMap.has(key)) rowMap.set(key, []);
    rowMap.get(key).push(idx);
  });

  // Sort rows by top position
  const sortedKeys = Array.from(rowMap.keys()).sort((a,b)=>a-b);
  sortedKeys.forEach(k => rows.push(rowMap.get(k)));

  const ready = new Array(cards.length).fill(false);
  let nextRow = 0;

  const MAX_WAIT = 2500;
  const failSafe = setTimeout(function(){
    cards.forEach(c => c.classList.add('is-visible'));
  }, MAX_WAIT);

  function waitForImage(img){
    return new Promise(function(resolve){
      if (!img) return resolve();
      if (img.complete && img.naturalWidth > 0) {
        if (img.decode) img.decode().then(resolve).catch(resolve);
        else resolve();
        return;
      }
      img.addEventListener('load', function(){
        if (img.decode) img.decode().then(resolve).catch(resolve);
        else resolve();
      }, { once: true });
      img.addEventListener('error', function(){ resolve(); }, { once: true });
    });
  }

  function tryReveal(){
    if (nextRow >= rows.length) {
      clearTimeout(failSafe);
      return;
    }
    const idxs = rows[nextRow];
    for (let i=0;i<idxs.length;i++){
      if (!ready[idxs[i]]) return;
    }
    // reveal this row together
    idxs.forEach(i => cards[i].classList.add('is-visible'));
    nextRow++;
    // small beat between rows for intentional feel
    setTimeout(tryReveal, 120);
  }

  function markReady(i){
    if (ready[i]) return;
    ready[i]=true;
    tryReveal();
  }

  cards.forEach(function(card, idx){
    const imgs = Array.from(card.querySelectorAll('img'));
    if (!imgs.length) { markReady(idx); return; }
    Promise.all(imgs.map(waitForImage)).then(function(){ markReady(idx); });
  });
});
