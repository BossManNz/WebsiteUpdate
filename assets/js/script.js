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

  // Rewrite root-absolute internal nav links ("/team/") to include GitHub Pages repo base ("/REPO/team/")
  (function(){
    var base = getSiteBase(); // "/" or "/WebsiteUpdate/"
    var navLinks = document.querySelectorAll('nav a[href^="/"]');
    navLinks.forEach(function(a){
      var href = a.getAttribute('href') || '';
      // keep external protocol links
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href)) return;
      // keep "/" as base root
      if (href === '/') { a.setAttribute('href', base); return; }
      a.setAttribute('href', base + href.replace(/^\//,''));
    });
  })();

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

  // Active link highlight by filename, handle / and /index.html
  const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  nav.querySelectorAll('ul li a').forEach(a=>{
    const target = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
    if((!target && current==='index.html') || target===current){
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

  function getSiteBase(){
    // Default: site served at domain root
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


  // Active link highlight (base-aware for GitHub Pages)
  (function(){
    var base = getSiteBase(); // "/" or "/REPO/"
    function norm(p){
      if(!p) return '/';
      p = p.split('?')[0].split('#')[0];
      p = p.replace(/\/+/g,'/');
      p = p.replace(/\/index\.html$/i,'/');
      if(!p.startsWith('/')) p = '/' + p;
      if(!/\.[a-z0-9]+$/i.test(p) && !p.endsWith('/')) p += '/';
      return p;
    }
    var current = norm(window.location.pathname);
    // If current starts with base, compare the remainder so "/REPO/team/" matches "/team/"
    if (base !== '/' && current.startsWith(base)) current = '/' + current.slice(base.length);
    document.querySelectorAll('nav a').forEach(function(a){
      var href = a.getAttribute('href') || '';
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
      var hp = norm(href);
      // strip base from link path too
      if (base !== '/' && hp.startsWith(base)) hp = '/' + hp.slice(base.length);
      if (hp === current) a.classList.add('active');
      else a.classList.remove('active');
    });
  })();
