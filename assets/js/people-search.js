// assets/js/people-search.js
(function () {
  var input = document.getElementById('peopleSearch');
  if (!input) return;

  function normalize(s) {
    return (s || '')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, ' ')      // collapse whitespace
      .trim();
  }

  function haystackFor(card) {
    // Prefer the canonical value from data-name
    var dn = card.dataset.name || '';
    // Also include visible name text and role, helpful for partial matches
    var nameEl = card.querySelector('.person-meta .name');
    var roleEl = card.querySelector('.person-meta .role');
    var visibleName = nameEl ? nameEl.textContent : '';
    var role = roleEl ? roleEl.textContent : '';
    return normalize(dn + ' ' + visibleName + ' ' + role);
  }

  function runSearch() {
    var q = normalize(input.value);
    var cards = document.querySelectorAll('.people-grid .person');
    cards.forEach(function (card) {
      var hay = haystackFor(card);
      card.style.display = hay.indexOf(q) !== -1 ? '' : 'none';
    });
  }

  // Debounce for nicer typing
  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 120);
  });

  // Run once on load
  runSearch();
})();