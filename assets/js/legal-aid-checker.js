
(function () {
  const root = document.querySelector('.he-checker');
  if (!root) return;

  const els = {
    typeBtns: Array.from(root.querySelectorAll('.he-seg__btn')),
    deps: root.querySelector('#deps'),
    income: root.querySelector('#income'),
    freq: root.querySelector('#incomeFreq'),
    savings: root.querySelector('#savings'),
    assets: root.querySelector('#assets'),
    ownHome: root.querySelector('#ownHome'),

    incomeLabel: root.querySelector('#incomeLabel'),
    incomeHelp: root.querySelector('#incomeHelp'),

    thresholdLabel: root.querySelector('#thresholdLabel'),
    thresholdVal: root.querySelector('#thresholdVal'),
    annualIncomeVal: root.querySelector('#annualIncomeVal'),
    netAssetsVal: root.querySelector('#netAssetsVal'),
    incomeStatus: root.querySelector('#incomeStatus'),
    statusPill: root.querySelector('#statusPill'),
    savingsNote: root.querySelector('#savingsNote'),

    reset: root.querySelector('#checkerReset'),
  };

  const THRESHOLDS = {
    single:   [28444, 45044, 64775, 73608, 82253, 91949],
    partnered:[45044, 64775, 73608, 82253, 91949, 99341],
  };

  const EXTRA_DEP_INCREMENT = 8192; // after 5 dependents

  let appType = 'single';

  function toNumber(v) {
    const n = Number(String(v || '').replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function fmtMoney(n) {
    const x = Math.round(toNumber(n));
    return '$' + x.toLocaleString('en-NZ');
  }

  function getDependents() {
    const d = Math.max(0, Math.floor(toNumber(els.deps.value)));
    els.deps.value = String(d);
    return d;
  }

  function annualiseIncome(amount, freq) {
    const a = toNumber(amount);
    if (!a) return 0;
    if (freq === 'week') return a * 52;
    if (freq === 'fortnight') return a * 26;
    return a;
  }

  function thresholdFor(type, deps) {
    const baseArr = THRESHOLDS[type] || THRESHOLDS.single;
    if (deps <= 5) return baseArr[deps] || baseArr[0];
    const base = baseArr[5];
    return base + (deps - 5) * EXTRA_DEP_INCREMENT;
  }

  function setType(next) {
    appType = next;
    els.typeBtns.forEach(btn => {
      const active = btn.dataset.type === next;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (next === 'partnered') {
      els.incomeLabel.textContent = 'Combined income (before tax)';
      els.incomeHelp.textContent = 'Include your partner’s income too. Use your best estimate, you can include benefit income.';
    } else {
      els.incomeLabel.textContent = 'Income (before tax)';
      els.incomeHelp.textContent = 'Enter your best estimate. You can include benefit income.';
    }
    update();
  }

  function update() {
    const deps = getDependents();
    const threshold = thresholdFor(appType, deps);

    const incomeAnnual = annualiseIncome(els.income.value, els.freq.value);
    const savings = toNumber(els.savings.value);
    const assets = toNumber(els.assets.value);
    const netAssets = savings + assets;

    els.thresholdLabel.textContent = `Guideline income threshold (${appType === 'partnered' ? 'Partnered' : 'Single'}, ${deps} dependents)`;
    els.thresholdVal.textContent = fmtMoney(threshold);
    els.annualIncomeVal.textContent = fmtMoney(incomeAnnual);
    els.netAssetsVal.textContent = fmtMoney(netAssets);

    // Status wording: never "eligible"
    const resultsEl = root.querySelector('.he-results');

    // Savings note (informational only)
    if (els.savingsNote) {
      els.savingsNote.hidden = !(savings > 0);
    }

    if (!incomeAnnual) {
      if (els.statusPill) els.statusPill.textContent = 'Enter your details';
      els.incomeStatus.textContent = 'Enter your details to see how your income compares with the guideline thresholds.';
      resultsEl.classList.remove('is-under', 'is-over');
      return;
    }

    if (incomeAnnual <= threshold) {
      if (els.statusPill) els.statusPill.textContent = 'Under guideline threshold';
      els.incomeStatus.textContent = 'This suggests your income is under the guideline threshold. Legal aid still depends on your full circumstances, including hardship factors.';
      resultsEl.classList.add('is-under');
      resultsEl.classList.remove('is-over');
    } else {
      if (els.statusPill) els.statusPill.textContent = 'Over guideline threshold (hardship may still apply)';
      els.incomeStatus.textContent = 'This suggests your income is above the guideline threshold. You may still qualify on hardship grounds, and legal aid can consider savings, assets, and other factors.';
      resultsEl.classList.add('is-over');
      resultsEl.classList.remove('is-under');
    }

  function reset() {
    setType('single');
    els.deps.value = '0';
    els.income.value = '';
    els.freq.value = 'year';
    els.savings.value = '';
    els.assets.value = '';
    els.ownHome.checked = false;
    update();
  }

  // Events
  els.typeBtns.forEach(btn => btn.addEventListener('click', () => setType(btn.dataset.type)));
  ['input', 'change'].forEach(ev => {
    els.deps.addEventListener(ev, update);
    els.income.addEventListener(ev, update);
    els.freq.addEventListener(ev, update);
    els.savings.addEventListener(ev, update);
    els.assets.addEventListener(ev, update);
    els.ownHome.addEventListener(ev, update);
  });
  els.reset.addEventListener('click', reset);

  // Init
  setType('single');
})();
