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

/* =====================================================
   Team page staged batch reveal (no spinner)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  if (!document.body.classList.contains('page-team')) return;

  const cards = Array.from(
    document.querySelectorAll('.people-grid .profile-card, .people-grid .person-card')
  );

  if (!cards.length) return;

  const queue = [];

  const BATCH_SIZE = 3;    // how many appear at once
  const BATCH_DELAY = 120; // ms between waves

  function flush() {
    if (!queue.length) return;

    queue.splice(0, BATCH_SIZE).forEach(card => {
      card.classList.add('is-visible');
    });

    if (queue.length) {
      setTimeout(flush, BATCH_DELAY);
    }
  }

  cards.forEach(card => {
    const img = card.querySelector('img');
    if (!img) return;

    function ready() {
      queue.push(card);
      if (queue.length === 1) flush();
    }

    if (img.complete && img.naturalWidth > 0) {
      if (img.decode) img.decode().then(ready).catch(ready);
      else ready();
    } else {
      img.addEventListener('load', ready);
      img.addEventListener('error', ready);
    }
  });
});
