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