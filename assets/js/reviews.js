(function () {
  const data = Array.isArray(window.HE_REVIEWS) ? window.HE_REVIEWS : [];
  const root = document.querySelector('#reviews');
  if (!root) return;

  const track = root.querySelector('.reviews-track');
  const dotsWrap = root.querySelector('.reviews-dots');
  const prev = root.querySelector('.reviews-nav.prev');
  const next = root.querySelector('.reviews-nav.next');

  // Render slides from data, if present
  if (data.length) {
    track.innerHTML = data.map(d => `
      <figure class="review">
        <div class="review-quote-icon" aria-hidden="true">
          <i class="fa-solid fa-quote-left"></i>
        </div>
        <blockquote class="review-text">${d.text}</blockquote>
        <figcaption class="review-client"><span class="client-name">${d.client}</span></figcaption>
      </figure>
    `).join("");

    dotsWrap.innerHTML = data.map((_, i) =>
      `<button class="dot${i === 0 ? " is-active" : ""}" aria-label="Jump to review ${i+1}"></button>`
    ).join("");
  }

  const slides = Array.from(track.querySelectorAll('.review'));
  const dots = Array.from(dotsWrap.querySelectorAll('.dot'));

  let index = 0;

  function viewportWidth() {
    const parent = track.parentElement;
    return parent ? parent.clientWidth : track.clientWidth;
  }

  function layout() {
    const w = viewportWidth();
    slides.forEach(s => { s.style.width = w + 'px'; });
    track.style.width = (w * slides.length) + 'px';
  }

  function update() {
    layout();
    const x = -(index * viewportWidth());
    track.style.transform = 'translateX(' + x + 'px)';
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }

  // Wire controls
  if (prev) prev.addEventListener('click', () => { goTo(index - 1); scheduleNext(); });
  if (next) next.addEventListener('click', () => { goTo(index + 1); scheduleNext(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); scheduleNext(); }));

  // Autoplay with reset using setTimeout to avoid sticky pauses
  let timer = null;
  const INTERVAL = 10000; // 10 seconds

  function scheduleNext() {
    if (timer) clearTimeout(timer);
    if (slides.length <= 1) return;
    timer = setTimeout(() => {
      goTo(index + 1);
      scheduleNext(); // chain the next hop
    }, INTERVAL);
  }

  // Stop when tab hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (timer) clearTimeout(timer);
      timer = null;
    } else {
      scheduleNext();
    }
  });

  // On resize, keep slide widths correct and keep autoplay predictable
  window.addEventListener('resize', () => { update(); scheduleNext(); });
  window.addEventListener('orientationchange', () => { update(); scheduleNext(); });

  // Initial paint and start
  update();
  scheduleNext();
})();
