(function () {
  const form = document.getElementById('eligibilityChecker');
  if (!form) return;

  // Income thresholds (1 July 2024), annual, before tax.
  // Index: 0 dependents, then 1..5 dependents. For 6+ dependents we use the 5+ threshold.
  const THRESHOLDS = {
    single: [28444, 45044, 64775, 73608, 82253, 91949],
    partnered: [45044, 64775, 73608, 82253, 91949, 99341],
  };

  const el = {
    dependents: document.getElementById('checkerDependents'),
    income: document.getElementById('checkerIncome'),
    incomePeriod: document.getElementById('checkerIncomePeriod'),
    savings: document.getElementById('checkerSavings'),
    assets: document.getElementById('checkerAssets'),
    debt: document.getElementById('checkerDebt'),
    threshold: document.getElementById('checkerThreshold'),
    annualised: document.getElementById('checkerAnnualised'),
    incomeStatus: document.getElementById('checkerIncomeStatus'),
    netWorth: document.getElementById('checkerNetWorth'),
    note: document.getElementById('checkerNote'),
    reset: document.getElementById('checkerReset'),
    incomeLabel: document.getElementById('checkerIncomeLabel'),
    incomeHelp: document.getElementById('checkerIncomeHelp'),
  };

  const nf = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: 0,
  });

  function parseMoney(raw) {
    if (!raw) return 0;
    const cleaned = String(raw)
      .replace(/[^0-9.\-]/g, '')
      .replace(/(\..*)\./g, '$1');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function formatMoney(n) {
    if (!Number.isFinite(n)) return 'N/A';
    return nf.format(n);
  }

  function getAppType() {
    const checked = form.querySelector('input[name="appType"]:checked');
    return checked && checked.value === 'partnered' ? 'partnered' : 'single';
  }

  function getDependents() {
    const d = Number(el.dependents && el.dependents.value);
    if (!Number.isFinite(d) || d < 0) return 0;
    return Math.min(Math.floor(d), 20);
  }

  function getIncomeMultiplier() {
    const p = el.incomePeriod && el.incomePeriod.value;
    if (p === 'weekly') return 52;
    if (p === 'fortnight') return 26;
    return 1; // annual
  }

  function describeIncomePeriod() {
    const p = el.incomePeriod && el.incomePeriod.value;
    if (p === 'weekly') return 'per week';
    if (p === 'fortnight') return 'per fortnight';
    return 'per year';
  }

  function update() {
    const appType = getAppType();
    const dep = getDependents();
    const depIdx = Math.min(dep, 5);
    const threshold = THRESHOLDS[appType][depIdx];

    const incomeEnteredRaw = parseMoney(el.income && el.income.value);
    const annualisedIncome = incomeEnteredRaw * getIncomeMultiplier();
    const savings = parseMoney(el.savings && el.savings.value);
    const assets = parseMoney(el.assets && el.assets.value);
    const debt = parseMoney(el.debt && el.debt.value);
    const netWorth = savings + assets - debt;

    const depLabel = dep >= 5 ? '5+ dependents' : `${dep} dependents`;
    const typeLabel = appType === 'partnered' ? 'Partnered' : 'Single';

    if (el.threshold) {
      const suffix = dep > 5 ? ' (using 5+ threshold)' : '';
      el.threshold.innerHTML = `Guideline income threshold (${typeLabel}, ${depLabel}): <strong>${formatMoney(threshold)}</strong>${suffix}`;
    }

    if (el.annualised) {
      el.annualised.innerHTML = `Your annualised income: <strong>${formatMoney(annualisedIncome)}</strong>`;
    }

    // Make it explicit what income to include.
    if (el.incomeLabel) {
      el.incomeLabel.textContent = appType === 'partnered'
        ? 'Combined income (before tax)'
        : 'Income (before tax)';
    }

    if (el.incomeHelp) {
      const base = appType === 'partnered'
        ? 'Include your income and your partner’s income.'
        : 'Enter your best estimate.';
      el.incomeHelp.textContent = `${base} You can include benefit income. (${describeIncomePeriod()})`;
    }

    if (el.netWorth) {
      el.netWorth.innerHTML = `Savings + sellable assets minus debt: <strong>${formatMoney(netWorth)}</strong>`;
    }

    const hasAnyInputs = [el.income, el.savings, el.assets, el.debt].some((x) => x && String(x.value || '').trim() !== '');
    if (!hasAnyInputs) {
      if (el.incomeStatus) el.incomeStatus.innerHTML = `Income comparison: <strong class="he-ios-muted">N/A</strong>`;
      if (el.note) el.note.textContent = 'Enter your details to see how your income compares with the guideline thresholds.';
      return;
    }

    const incomeEntered = el.income && String(el.income.value || '').trim() !== '';
    if (!incomeEntered) {
      if (el.incomeStatus) el.incomeStatus.innerHTML = `Income comparison: <strong>Enter income to compare</strong>`;
      if (el.note) el.note.textContent = 'Income is the quickest first check, add your before-tax amount (weekly, fortnightly, or annual) to compare with the guideline thresholds.';
      return;
    }

    const under = annualisedIncome <= threshold;

    if (el.incomeStatus) {
      el.incomeStatus.innerHTML = under
        ? `Income comparison: <strong class="he-ios-status he-ios-status--under">Under guideline threshold</strong>`
        : `Income comparison: <strong class="he-ios-status he-ios-status--over">Over guideline threshold (hardship may still apply)</strong>`;
    }

    if (el.note) {
      if (under) {
        el.note.textContent = 'Your income is under the guideline threshold for your household size. This is not a decision, legal aid can also consider savings, assets, debt, and hardship factors.';
      } else {
        el.note.textContent = 'Your income is over the guideline threshold. You may still qualify on hardship grounds, and legal aid can consider savings, assets, and debt.';
      }
    }
  }

  function tidyMoneyInput(e) {
    const input = e && e.target;
    if (!input) return;
    const n = parseMoney(input.value);
    if (!input.value || String(input.value).trim() === '') return;
    input.value = n ? nf.format(n).replace(/\$\s?/, '') : '';
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);

  ['checkerIncome', 'checkerSavings', 'checkerAssets', 'checkerDebt'].forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.addEventListener('blur', tidyMoneyInput);
  });

  if (el.reset) {
    el.reset.addEventListener('click', () => {
      const single = form.querySelector('input[name="appType"][value="single"]');
      if (single) single.checked = true;
      if (el.dependents) el.dependents.value = '0';
      if (el.income) el.income.value = '';
      if (el.savings) el.savings.value = '';
      if (el.assets) el.assets.value = '';
      if (el.debt) el.debt.value = '';
      update();
    });
  }

  update();
})();
