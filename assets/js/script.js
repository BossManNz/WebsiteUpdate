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

  // Active nav (GitHub Pages base-aware, clean URLs)
  function getSiteBase(){
    var base = '/';
    try{
      var host = (window.location.hostname || '').toLowerCase();
      var path = window.location.pathname || '/';
      if (host.endsWith('github.io')){
        var seg = path.split('/').filter(Boolean);
        if (seg.length > 0) base = '/' + seg[0] + '/';
      }
    } catch(e){}
    return base;
  }

  function localPathname(){
    var base = getSiteBase();
    var p = (window.location.pathname || '/').split('?')[0].split('#')[0];
    p = p.replace(/\/+/g,'/').replace(/\/index\.html$/i,'/');
    if (!p.startsWith('/')) p = '/' + p;
    if (!/\.[a-z0-9]+$/i.test(p) && !p.endsWith('/')) p += '/';
    // strip base ("/REPO/") so we compare like "/services/"
    if (base !== '/' && p.startsWith(base)) p = '/' + p.slice(base.length);
    return { base: base, path: p };
  }

  (function(){
    var info = localPathname();
    var base = info.base;
    var path = info.path;

    // figure current route segment ("" for home)
    var segs = path.split('/').filter(Boolean);
    var route = segs.length ? segs[0].toLowerCase() : '';

    // Rewrite home links (logo/home) to base so they never go to /index
    document.querySelectorAll('a[href]').forEach(function(a){
      var href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
      // resolve to pathname
      var p = '';
      try { p = new URL(href, window.location.href).pathname; } catch(e){ p = href; }
      p = (p || '').toString();
      if (/(^|\/)index(\.html?)?\/?$/i.test(p) || p === '/'){
        a.setAttribute('href', base);
      }
    });

    // Mark active nav items by matching first path segment
    var nav = document.querySelector('nav') || document.querySelector('.navbar') || document.querySelector('header');
    if (!nav) return;

    nav.querySelectorAll('a[href]').forEach(function(a){
      var href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      var p = '';
      try { p = new URL(href, window.location.href).pathname; } catch(e){ p = href; }
      p = (p || '').toString().replace(/\/+/g,'/').replace(/\/index\.html$/i,'/');
      if (!p.startsWith('/')) p = '/' + p;
      if (!/\.[a-z0-9]+$/i.test(p) && !p.endsWith('/')) p += '/';
      if (base !== '/' && p.startsWith(base)) p = '/' + p.slice(base.length);

      var s = p.split('/').filter(Boolean);
      var linkRoute = s.length ? s[0].toLowerCase() : '';

      var isActive = (linkRoute === route);
      // special case: home
      if (route === '' && linkRoute === '') isActive = true;

      a.classList.toggle('active', isActive);
      var li = a.closest('li');
      if (li) li.classList.toggle('active', isActive);
    });
  })();

var currentLocal = current;
    if (base !== '/' && currentLocal.startsWith(base)) currentLocal = '/' + currentLocal.slice(base.length);

    // Fix HOME links everywhere (logo, "Home", etc)
    document.querySelectorAll('a[href]').forEach(function(a){
      var href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
      var h = href;
      if (h === '/' || h === 'index' || h === 'index/' || h === 'index.html' || h === '/index' || h === '/index/' || h === '/index.html') {
        a.setAttribute('href', base);
      }
    });

    // Active class within navbar scope
    var scope = document.querySelector('nav') || document.querySelector('.navbar') || document.querySelector('header') || document.body;
    scope.querySelectorAll('a[href]').forEach(function(a){
      var href = (a.getAttribute('href') || '').trim();
      if (!href) return;
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      var absPath = '';
      try { absPath = new URL(href, window.location.href).pathname; } catch(e){ absPath = href; }
      absPath = absPath.split('?')[0].split('#')[0].replace(/\/+/g,'/').replace(/\/index\.html$/i,'/');
      if(!absPath.startsWith('/')) absPath = '/' + absPath;
      if(!/\.[a-z0-9]+$/i.test(absPath) && !absPath.endsWith('/')) absPath += '/';

      var targetLocal = absPath;
      if (base !== '/' && targetLocal.startsWith(base)) targetLocal = '/' + targetLocal.slice(base.length);

      if (targetLocal === currentLocal){
        a.classList.add('active');
        var li = a.closest('li');
        if (li) li.classList.add('active');
      } else {
        a.classList.remove('active');
        var li2 = a.closest('li');
        if (li2) li2.classList.remove('active');
      }
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