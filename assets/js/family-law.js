document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".familylaw .tab");
  const panels = document.querySelectorAll(".familylaw .tabpanel");

  function activate(tabId) {
    tabs.forEach(btn => {
      const active = btn.getAttribute("aria-controls") === tabId;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active);
    });
    panels.forEach(p => p.classList.toggle("is-active", p.id === tabId));
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => activate(btn.getAttribute("aria-controls")));
  });

  // Load from URL hash if available
  if (location.hash) {
    const hash = location.hash.replace("#", "");
    if (document.getElementById(hash)) activate(hash);
  }
});
