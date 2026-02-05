/* Legal Aid Eligibility Tool (threshold checker + disclaimer + collapsible panel) */
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
  const savingsEl = document.getElementById('heSavings');
  const assetsEl = document.getElementById('heAssets');
  const resetBtn = document.getElementById('heResetBtn');

  const outcomeEl = document.getElementById('heOutcome');
  const outcomeSubEl = document.getElementById('heOutcomeSub');
  const thresholdLabelEl = document.getElementById('heThresholdLabel');
  const thresholdValueEl = document.getElementById('heThresholdValue');
  const annualValueEl = document.getElementById('heAnnualValue');
  const diffValueEl = document.getElementById('heDiffValue');
  const savingsNoteEl = document.getElementById('heSavingsNote');

  const incomeLabelEl = document.getElementById('heIncomeLabel');
  const incomeHelpEl = document.getElementById('heIncomeHelp');

  const modal = document.getElementById('heDisclaimerModal');
  const modalAck = document.getElementById('heDisclaimerAck');
  const modalContinue = document.getElementById('heModalContinue');
  const modalCancel = document.getElementById('heModalCancel');

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
    // Update copy
    if (val === 'partnered') {
      if (incomeLabelEl) incomeLabelEl.textContent = 'Combined income (before tax)';
      if (incomeHelpEl) incomeHelpEl.textContent = 'Enter your best estimate. Include your partner’s income as well.';
    } else {
      if (incomeLabelEl) incomeLabelEl.textContent = 'Income (before tax)';
      if (incomeHelpEl) incomeHelpEl.textContent = 'Enter your best estimate. You can include benefit income.';
    }
    update();
  }

  function annualise(income, freq) {
    const x = Number(income) || 0;
    if (!x) return 0;
    if (freq === 'week') return x * 52;
    if (freq === 'fortnight') return x * 26;
    return x;
  }

  function thresholdFor(app, deps) {
    const d = Math.max(0, Math.floor(Number(deps) || 0));
    const base = THRESHOLDS[app] || THRESHOLDS.single;
    if (d <= 5) return (base[d] ?? base[5] ?? 0);
    const extra = (d - 5) * EXTRA_DEP;
    return (base[5] ?? 0) + extra;
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
    if (!hasIncome) {
      outcomeEl.textContent = 'Enter your details';
      outcomeSubEl.textContent = 'Enter your details to see how your income compares with the thresholds.';
      outcomeEl.style.color = '#1d1d1f';
      return;
    }

    if (annual < threshold) {
      outcomeEl.textContent = 'Under the income threshold';
      outcomeEl.style.color = '#1a7f37'; // green
      outcomeSubEl.textContent = 'Based on what you entered, your income is under the income threshold. Legal aid still depends on your full circumstances, including hardship factors.';
    } else if (annual > threshold) {
      outcomeEl.textContent = 'Over the income threshold (hardship may still apply)';
      outcomeEl.style.color = '#b10f1e';
      outcomeSubEl.textContent = 'Based on what you entered, your income is over the income threshold. You may still qualify on hardship grounds, and Legal Aid can consider other factors.';
    } else {
      outcomeEl.textContent = 'At the income threshold';
      outcomeEl.style.color = '#1d1d1f';
      outcomeSubEl.textContent = 'Based on what you entered, your income is at the income threshold. Legal aid still depends on your full circumstances, including hardship factors.';
    }
  }

  function update() {
    const app = getAppType();
    const deps = Number(depsEl?.value || 0);
    const income = Number(incomeEl?.value || 0);
    const freq = (freqEl?.value || 'year');
    const savings = Number(savingsEl?.value || 0);
    const assets = Number(assetsEl?.value || 0);

    const threshold = thresholdFor(app, deps);
    const annual = annualise(income, freq);

    if (thresholdLabelEl) thresholdLabelEl.textContent = `Income threshold (${app === 'partnered' ? 'Partnered' : 'Single'}, ${Math.max(0, Math.floor(deps || 0))} dependents)`;
    if (thresholdValueEl) thresholdValueEl.textContent = money(threshold);
    if (annualValueEl) annualValueEl.textContent = money(annual);
    if (diffValueEl) diffValueEl.textContent = diffText(annual, threshold);

    updateOutcome(annual, threshold);

    if (savingsNoteEl) {
      if (savings > 0) savingsNoteEl.classList.remove('he-callout-inline--hidden');
      else savingsNoteEl.classList.add('he-callout-inline--hidden');
    }
  }

  function reset() {
    if (depsEl) depsEl.value = 0;
    if (incomeEl) incomeEl.value = 0;
    if (freqEl) freqEl.value = 'year';
    if (savingsEl) savingsEl.value = 0;
    if (assetsEl) assetsEl.value = 0;
    update();
  }
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

  function showModal() {
    if (!modal) return;
    modal.classList.add('he-modal--open');
    modal.setAttribute('aria-hidden', 'false');
    if (modalAck) modalAck.checked = false;
    if (modalContinue) modalContinue.disabled = true;
  }

  function hideModal() {
    if (!modal) return;
    modal.classList.remove('he-modal--open');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Toggle open/close with click or keyboard
  function tryOpenOrClose() {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closePanel();
      return;
    }
    showModal();}

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
  [depsEl, incomeEl, freqEl, savingsEl, assetsEl].forEach(el => {
    if (!el) return;
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  if (resetBtn) resetBtn.addEventListener('click', reset);

  // Modal actions
  if (modalAck && modalContinue) {
    modalAck.addEventListener('change', () => {
      modalContinue.disabled = !modalAck.checked;
    });
  }
  if (modalContinue) {
    modalContinue.addEventListener('click', () => {
      if (modalAck && !modalAck.checked) return;      hideModal();
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

  // Default: collapsed
  closePanel();
  // Default app type
  setAppType('single');
  update();
})();
