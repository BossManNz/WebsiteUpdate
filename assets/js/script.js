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
    }
  });
})();

// Page fade-in on load
document.addEventListener('DOMContentLoaded', function(){

  // GitHub Pages base-aware nav fixing (prevents /index 404 and fixes active state everywhere)
  function getSiteBase(){
    // Default: domain root
    var base = '/';
    try{
      var host = (window.location.hostname || '').toLowerCase();
      var path = window.location.pathname || '/';
      // GitHub Pages project site: https://user.github.io/repo/...
      if (host.endsWith('github.io')) {
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

  (function(){
    var base = getSiteBase();           // "/" or "/WebsiteUpdate/"
    var current = normPath(window.location.pathname);
    // Strip base for comparisons
    var currentLocal = current;
    if (base !== '/' && currentLocal.startsWith(base)) currentLocal = '/' + currentLocal.slice(base.length);

    // Rewrite nav links to absolute-with-base routes so they never nest like /services/team/
    document.querySelectorAll('nav a[href]').forEach(function(a){
      var href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      // external
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      // Decide route from existing href
      // Home candidates
      if (href === './' || href === '../' || href === '../../' || href === '/' || href === 'index' || href === 'index/' || href === 'index.html' || href === '/index' || href === '/index/' || href === '/index.html') {
        a.setAttribute('href', base);
        href = base;
      } else {
        // Convert to path, take last segment as route when it looks like a folder route
        var path;
        try { path = new URL(href, window.location.href).pathname; }
        catch(e){ path = href; }
        path = normPath(path);
        // Strip base if present
        if (base !== '/' && path.startsWith(base)) path = '/' + path.slice(base.length);
        var seg = path.split('/').filter(Boolean);
        if (seg.length > 0) {
          // If link is to a route root like "/team/", keep only that first segment
          var route = seg[0];
          a.setAttribute('href', base + route + '/');
          href = base + route + '/';
        }
      }
    });

    // Now apply active class (base-aware)
    document.querySelectorAll('nav a[href]').forEach(function(a){
      var href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      var path;
      try { path = new URL(href, window.location.href).pathname; }
      catch(e){ path = href; }
      path = normPath(path);
      var local = path;
      if (base !== '/' && local.startsWith(base)) local = '/' + local.slice(base.length);

      if (local === currentLocal) a.classList.add('active');
      else a.classList.remove('active');
    });
  })();

  }
  const current = normPath(window.location.pathname);

  document.querySelectorAll('nav a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
    let absPath = '';
    try { absPath = new URL(href, window.location.href).pathname; }
    catch (e) { absPath = href; }
    const target = normPath(absPath);
    if (target === current) a.classList.add('active');
    else a.classList.remove('active');
  });

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