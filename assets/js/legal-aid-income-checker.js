/* Legal Aid Income Checker (income-only threshold checker + multi-step disclaimer + collapsible panel)
   Notes:
   - No localStorage. Panel is collapsed on every page load.
   - Disclaimer is required once per page load.
*/
(function () {
  const THRESHOLDS = {
    single: { 0: 28444, 1: 45044, 2: 64775, 3: 73608, 4: 82253, 5: 91949 },
    partnered: { 0: 45044, 1: 64775, 2: 73608, 3: 82253, 4: 91949, 5: 99341 }
  };
  const EXTRA_DEP = 8192;

  const toggle = document.getElementById('heToolToggle');
  const panel = document.getElementById('heToolPanel');
  if (!toggle || !panel) return;

  const segBtns = Array.from(document.querySelectorAll('.he-seg__btn'));
  const depsEl = document.getElementById('heDeps');
  const incomeEl = document.getElementById('heIncome');
  const freqEl = document.getElementById('heIncomeFreq');
  const resetBtn = document.getElementById('heResetBtn');

  const outcomeEl = document.getElementById('heOutcome');
  const outcomeSubEl = document.getElementById('heOutcomeSub');
  const decisionWarningEl = document.getElementById('heDecisionWarning');

  const thresholdLabelEl = document.getElementById('heThresholdLabel');
  const thresholdValueEl = document.getElementById('heThresholdValue');
  const annualValueEl = document.getElementById('heAnnualValue');
  const diffValueEl = document.getElementById('heDiffValue');

  const incomeLabelEl = document.getElementById('heIncomeLabel');
  const incomeHelpEl = document.getElementById('heIncomeHelp');

  // Modal
  const modal = document.getElementById('heDisclaimerModal');
  const modalContinue = document.getElementById('heModalContinue');
  const modalCancel = document.getElementById('heModalCancel');
  const acks = [
    document.getElementById('heAck1'),
    document.getElementById('heAck2'),
    document.getElementById('heAck3'),
    document.getElementById('heAck4')
  ].filter(Boolean);

  let disclaimerAccepted = false;

  function money(n) {
    const v = Math.round(Number(n) || 0);
    return '$' + v.toLocaleString('en-NZ');
  }

  function getAppType() {
    const active = segBtns.find(b => b.classList.contains('he-seg__btn--active'));
    return active ? active.getAttribute('data-app') : 'single';
  }

  function setAppType(val) {
    segBtns.forEach(b => b.classList.toggle('he-seg__btn--active', b.getAttribute('data-app') === val));
    if (val === 'partnered') {
      if (incomeLabelEl) incomeLabelEl.textContent = 'Total combined income (before tax)';
      if (incomeHelpEl) incomeHelpEl.textContent = 'Enter your best estimate. Include your partner’s income as well.';
    } else {
      if (incomeLabelEl) incomeLabelEl.textContent = 'Total income (before tax)';
      if (incomeHelpEl) incomeHelpEl.textContent = 'Enter your best estimate.';
    }
    update();
  }

  function annualise(income, freq) {
    const x = Number(income) || 0;
    if (!x) return 0;
    if (freq === 'week') return x * 52;
    if (freq === 'fortnight') return x * 26;
    return x; // year
  }

  function thresholdFor(app, deps) {
    const d = Math.max(0, Math.floor(Number(deps) || 0));
    const base = THRESHOLDS[app] || THRESHOLDS.single;
    if (d <= 5) return (base[d] ?? base[5] ?? 0);
    return (base[5] ?? 0) + (d - 5) * EXTRA_DEP;
  }

  function diffText(annual, threshold) {
    const diff = Math.round(Math.abs(annual - threshold));
    if (!annual || !threshold) return money(0);
    if (annual === threshold) return money(0) + ' at threshold';
    if (annual < threshold) return money(diff) + ' under threshold';
    return money(diff) + ' over threshold';
  }

  function updateOutcome(annual, threshold) {
    const hasIncome = annual > 0;

    if (decisionWarningEl) decisionWarningEl.style.display = hasIncome ? 'flex' : 'none';

    if (!hasIncome) {
      if (outcomeEl) outcomeEl.textContent = 'Enter your details';
      if (outcomeSubEl) outcomeSubEl.textContent = 'Enter your income to compare it with the published income thresholds (estimate only, not a decision).';
      if (outcomeEl) outcomeEl.style.color = '#1d1d1f';
      return;
    }

    if (annual < threshold) {
      if (outcomeEl) outcomeEl.textContent = 'You may be under the income threshold';
      if (outcomeEl) outcomeEl.style.color = '#1a7f37';
      if (outcomeSubEl) outcomeSubEl.textContent = 'Based on what you entered, your income appears under the published threshold. Legal Aid Services apply additional assessments we do not have access to.';
    } else if (annual > threshold) {
      if (outcomeEl) outcomeEl.textContent = 'You may be over the income threshold (hardship may still apply)';
      if (outcomeEl) outcomeEl.style.color = '#b10f1e';
      if (outcomeSubEl) outcomeSubEl.textContent = 'Based on what you entered, your income appears over the published threshold. You may still qualify on hardship grounds, and Legal Aid Services apply additional assessments we do not have access to.';
    } else {
      if (outcomeEl) outcomeEl.textContent = 'You are around the income threshold';
      if (outcomeEl) outcomeEl.style.color = '#1d1d1f';
      if (outcomeSubEl) outcomeSubEl.textContent = 'Based on what you entered, your income appears around the published threshold. Legal Aid Services apply additional assessments we do not have access to.';
    }
  }

  function update() {
    const app = getAppType();
    const deps = Number(depsEl?.value || 0);
    const income = Number(incomeEl?.value || 0);
    const freq = (freqEl?.value || 'year');

    const threshold = thresholdFor(app, deps);
    const annual = annualise(income, freq);

    const depNum = Math.max(0, Math.floor(deps || 0));
    if (thresholdLabelEl) thresholdLabelEl.textContent = `Income threshold (${app === 'partnered' ? 'Partnered' : 'Single'}, ${depNum} dependents)`;
    if (thresholdValueEl) thresholdValueEl.textContent = money(threshold);
    if (annualValueEl) annualValueEl.textContent = money(annual);
    if (diffValueEl) diffValueEl.textContent = diffText(annual, threshold);

    updateOutcome(annual, threshold);
  }

  function reset() {
    if (depsEl) depsEl.value = 0;
    if (incomeEl) incomeEl.value = 0;
    if (freqEl) freqEl.value = 'year';
    update();
  }

  function openPanel() {
    panel.classList.remove('he-tool__panel--collapsed');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    update();
  }

  function closePanel() {
    panel.classList.add('he-tool__panel--collapsed');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function syncContinueBtn() {
    if (!modalContinue) return;
    const allChecked = acks.length ? acks.every(x => x && x.checked) : false;
    modalContinue.disabled = !allChecked;
  }

  function showModal() {
    if (!modal) return;
    modal.classList.add('he-modal--open');
    modal.setAttribute('aria-hidden', 'false');
    acks.forEach(x => { if (x) x.checked = false; });
    syncContinueBtn();
  }

  function hideModal() {
    if (!modal) return;
    modal.classList.remove('he-modal--open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function tryOpenOrClose() {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closePanel();
      return;
    }
    if (disclaimerAccepted) {
      openPanel();
      return;
    }
    showModal();
  }

  // Toggle open/close with click or keyboard
  toggle.addEventListener('click', tryOpenOrClose);
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tryOpenOrClose();
    }
  });

  // Segmented buttons
  segBtns.forEach(btn => {
    btn.addEventListener('click', () => setAppType(btn.getAttribute('data-app')));
  });

  // Inputs
  [depsEl, incomeEl, freqEl].forEach(el => {
    if (!el) return;
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  if (resetBtn) resetBtn.addEventListener('click', reset);

  // Modal: enable Continue only when all acks checked
  acks.forEach(chk => chk && chk.addEventListener('change', syncContinueBtn));

  if (modalContinue) {
    modalContinue.addEventListener('click', () => {
      syncContinueBtn();
      if (modalContinue.disabled) return;
      disclaimerAccepted = true;
      hideModal();
      openPanel();
    });
  }

  if (modalCancel) modalCancel.addEventListener('click', () => { hideModal(); closePanel(); });

  if (modal) {
    modal.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute('data-close') === '1') {
        hideModal();
        closePanel();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('he-modal--open')) {
        hideModal();
        closePanel();
      }
    });
  }

  // Default: collapsed every load
  closePanel();
  setAppType('single');
  update();
})();
