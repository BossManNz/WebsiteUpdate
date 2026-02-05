(() => {
  const el = (id) => document.getElementById(id);

  const appButtons = Array.from(document.querySelectorAll('.segmented-btn[data-app-type]'));
  const dependentsEl = el('laDependents');
  const incomeEl = el('laIncome');
  const freqEl = el('laIncomeFreq');
  const savingsEl = el('laSavings');
  const assetsEl = el('laAssets');
  const ownHomeEl = el('laOwnHome');

  const incomeLabelEl = el('incomeLabel');
  const incomeHelpEl = el('incomeHelp');
  const thresholdLabelEl = el('laThresholdLabel');

  const statusEl = el('laStatus');
  const thresholdValueEl = el('laThresholdValue');
  const annualIncomeEl = el('laAnnualIncome');
  const netAssetsEl = el('laNetAssets');
  const noteEl = el('laNote');
  const resetEl = el('laReset');

  if (!dependentsEl || !incomeEl || !freqEl || !savingsEl || !assetsEl || !statusEl) return;

  const thresholds = {
    single: [28444, 45044, 64775, 73608, 82253, 91949],
    partnered: [45044, 64775, 73608, 82253, 91949, 99341],
  };

  let appType = 'single';

  const parseMoney = (raw) => {
    if (!raw) return 0;
    const cleaned = String(raw).replace(/[^0-9.]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const formatNZD = (n) => {
    const v = Math.round(Number(n) || 0);
    return '$' + v.toLocaleString('en-NZ');
  };

  const clampDependentsIndex = (d) => {
    if (!Number.isFinite(d) || d < 0) return 0;
    if (d >= 5) return 5;
    return Math.floor(d);
  };

  const annualiseIncome = (amount, freq) => {
    const a = Number(amount) || 0;
    if (freq === 'week') return a * 52;
    if (freq === 'fortnight') return a * 26;
    return a; // year
  };

  const setAppType = (next) => {
    appType = next === 'partnered' ? 'partnered' : 'single';
    appButtons.forEach((b) => {
      const isActive = b.dataset.appType === appType;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (appType === 'partnered') {
      incomeLabelEl.textContent = 'Combined income (before tax)';
      incomeHelpEl.textContent = "Include your partner's income too. Use your best estimate (you can include benefit income).";
    } else {
      incomeLabelEl.textContent = 'Income (before tax)';
      incomeHelpEl.textContent = 'Enter your best estimate. You can include benefit income.';
    }

    update();
  };

  const getThreshold = () => {
    const d = Number(dependentsEl.value || 0);
    const idx = clampDependentsIndex(d);
    const list = thresholds[appType];
    return list[idx] ?? list[list.length - 1];
  };

  const update = () => {
    const dep = Number(dependentsEl.value || 0);
    const idx = clampDependentsIndex(dep);

    const threshold = getThreshold();
    const incomeRaw = parseMoney(incomeEl.value);
    const annualIncome = annualiseIncome(incomeRaw, freqEl.value);

    const savings = parseMoney(savingsEl.value);
    const assets = parseMoney(assetsEl.value);
    const netAssets = savings + assets;

    // Labels
    const depLabel = dep >= 5 ? '5+ dependents' : `${idx} dependents`;
    thresholdLabelEl.textContent = `Guideline income threshold (${appType === 'partnered' ? 'Partnered' : 'Single'}, ${depLabel})`;

    thresholdValueEl.textContent = formatNZD(threshold);
    annualIncomeEl.textContent = formatNZD(annualIncome);
    netAssetsEl.textContent = formatNZD(netAssets);

    const hasAnyInput =
      String(incomeEl.value || '').trim() !== '' ||
      String(savingsEl.value || '').trim() !== '' ||
      String(assetsEl.value || '').trim() !== '' ||
      String(dependentsEl.value || '').trim() !== '';

    statusEl.classList.remove('is-under', 'is-over');

    if (!hasAnyInput || annualIncome <= 0) {
      statusEl.textContent = 'Enter your details to compare with the guideline thresholds.';
      noteEl.textContent = 'This is a guideline comparison only. Legal aid can still consider hardship and other circumstances.';
      return;
    }

    if (annualIncome <= threshold) {
      statusEl.textContent = 'Based on income, you appear under the guideline threshold.';
      statusEl.classList.add('is-under');
      noteEl.textContent = 'This suggests your income is under the guideline threshold. Legal aid may still consider your savings, assets, and hardship factors.';
    } else {
      statusEl.textContent = 'Based on income, you appear over the guideline threshold (hardship may still apply).';
      statusEl.classList.add('is-over');
      noteEl.textContent = 'This suggests your income is over the guideline threshold. You may still qualify on hardship grounds, and legal aid can consider savings, assets, and your circumstances.';
    }

    // Home toggle is informational only, but we keep it from feeling pointless by slightly adjusting the note
    if (ownHomeEl && ownHomeEl.checked) {
      noteEl.textContent += ' (Your main home is usually excluded from asset calculations.)';
    }
  };

  // Segmented control events
  appButtons.forEach((b) => b.addEventListener('click', () => setAppType(b.dataset.appType)));

  // Input events
  [dependentsEl, incomeEl, freqEl, savingsEl, assetsEl, ownHomeEl].forEach((node) => {
    if (!node) return;
    node.addEventListener('input', update);
    node.addEventListener('change', update);
  });

  // Reset
  if (resetEl) {
    resetEl.addEventListener('click', () => {
      setAppType('single');
      dependentsEl.value = '0';
      incomeEl.value = '';
      freqEl.value = 'year';
      savingsEl.value = '';
      assetsEl.value = '';
      if (ownHomeEl) ownHomeEl.checked = false;
      update();
    });
  }

  // Initial state
  setAppType('single');
})();
