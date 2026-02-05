/* Legal Aid Eligibility Tool (threshold checker + disclaimer + collapsible panel) */
(function () {
  const THRESHOLDS = {"single": {"0": 28444, "1": 45044, "2": 64775, "3": 73608, "4": 82253, "5": 91949}, "partnered": {"0": 45044, "1": 64775, "2": 73608, "3": 82253, "4": 91949, "5": 99341}};
  const EXTRA_DEP = 8192;

  const openBtn = document.getElementById('heToolToggle');
  const panel = document.getElementById('heToolPanel');

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

  const modal = document.getElementById('heDisclaimerModal');
  const modalAck = document.getElementById('heDisclaimerAck');
  const modalContinue = document.getElementById('heModalContinue');
  const modalCancel = document.getElementById('heModalCancel');

  const ACK_KEY = 'heLegalAidToolAck_v1';
  const ACK_DAYS = 30;

  function money(n) {
    const v = Math.round(Number(n) || 0);
    return '$' + v.toLocaleString('en-NZ');
  }

  function getAppType() {
    const active = segBtns.find(b => b.classList.contains('he-seg__btn--active'));
    return active ? active.getAttribute('data-app') : 'single';
  }

  function setAppType(val) {
    segBtns.forEach(b => {
      b.classList.toggle('he-seg__btn--active', b.getAttribute('data-app') === val);
    });
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

  function hasAck() {
    try {
      const raw = localStorage.getItem(ACK_KEY);
      if (!raw) return false;
      const t = Number(raw);
      if (!t) return false;
      const ageMs = Date.now() - t;
      return ageMs < (ACK_DAYS * 24 * 60 * 60 * 1000);
    } catch (e) {
      return false;
    }
  }

  function storeAck() {
    try {
      localStorage.setItem(ACK_KEY, String(Date.now()));
    } catch (e) {}
  }

  function showModal() {
    modal.classList.remove('he-hidden');
    modal.setAttribute('aria-hidden', 'false');
    modalAck.checked = false;
    modalContinue.disabled = true;
    document.body.classList.add('he-modal-open');
  }

  function hideModal() {
    modal.classList.add('he-hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('he-modal-open');
  }

  function openPanel() {
    panel.classList.remove('he-tool__panel--collapsed');
    panel.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    update();
  }

  function closePanel() {
    panel.classList.add('he-tool__panel--collapsed');
    panel.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
  }

  function update() {
    const app = getAppType();
    const deps = Math.max(0, Math.floor(Number(depsEl.value) || 0));
    const incomeRaw = Number(incomeEl.value) || 0;
    const freq = freqEl.value;
    const annual = annualise(incomeRaw, freq);
    const thr = thresholdFor(app, deps);

    const labelApp = app === 'partnered' ? 'Partnered' : 'Single';
    thresholdLabelEl.textContent = `Income threshold (${labelApp}, ${deps} dependents)`;
    thresholdValueEl.textContent = money(thr);
    annualValueEl.textContent = money(annual);

    if (!incomeRaw) {
      outcomeEl.textContent = 'Enter your income to see how it compares to the threshold';
      outcomeEl.classList.remove('he-outcome--under', 'he-outcome--over');
      outcomeSubEl.textContent = 'This is not a Legal Aid decision. Eligibility is determined by the Ministry of Justice.';
      diffValueEl.textContent = money(0);
    } else {
      const diff = Math.abs(annual - thr);
      const over = annual > thr;
      const under = annual < thr;

      if (under) {
        outcomeEl.textContent = 'Under the income threshold';
        outcomeEl.classList.add('he-outcome--under');
        outcomeEl.classList.remove('he-outcome--over');
        outcomeSubEl.textContent = 'Based on what you entered, your income is under the income threshold. Legal aid still depends on your full circumstances, including hardship factors.';
        diffValueEl.textContent = `${money(diff)} under threshold`;
      } else if (over) {
        outcomeEl.textContent = 'Over the income threshold (hardship may still apply)';
        outcomeEl.classList.add('he-outcome--over');
        outcomeEl.classList.remove('he-outcome--under');
        outcomeSubEl.textContent = 'Based on what you entered, your income is over the income threshold. You may still qualify on hardship grounds, and Legal Aid can consider other factors.';
        diffValueEl.textContent = `${money(diff)} over threshold`;
      } else {
        outcomeEl.textContent = 'At the income threshold';
        outcomeEl.classList.remove('he-outcome--under', 'he-outcome--over');
        outcomeSubEl.textContent = 'Based on what you entered, your income matches the income threshold. Other factors can still affect the decision.';
        diffValueEl.textContent = money(0);
      }
    }

    const savingsVal = Number(savingsEl.value) || 0;
    savingsNoteEl.classList.toggle('he-hidden', !(savingsVal > 0));
  }

  function reset() {
    setAppType('single');
    depsEl.value = 0;
    incomeEl.value = '';
    freqEl.value = 'year';
    savingsEl.value = '';
    assetsEl.value = '';
    update();
  }

  segBtns.forEach(btn => {
    btn.addEventListener('click', () => setAppType(btn.getAttribute('data-app')));
  });

  [depsEl, incomeEl, freqEl, savingsEl, assetsEl].forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  resetBtn.addEventListener('click', reset);

  openBtn.addEventListener('click', () => {
    if (!panel.classList.contains('he-tool__panel--collapsed')) {
      closePanel();
      return;
    }
    if (hasAck()) openPanel();
    else showModal();
  });

  modalAck.addEventListener('change', () => {
    modalContinue.disabled = !modalAck.checked;
  });

  modalContinue.addEventListener('click', () => {
    if (!modalAck.checked) return;
    storeAck();
    hideModal();
    openPanel();
  });

  modalCancel.addEventListener('click', hideModal);

  modal.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute('data-close') === '1') hideModal();
  });

  closePanel();
  update();
})();