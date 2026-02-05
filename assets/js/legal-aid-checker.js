(function () {
  function clampInt(v) {
    var n = parseInt(v, 10);
    if (isNaN(n) || n < 0) return 0;
    return n;
  }

  function toNumber(v) {
    var n = Number(v);
    if (!isFinite(n) || n < 0) return 0;
    return n;
  }

  function fmtMoney(n) {
    try {
      return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }

  var THRESHOLDS = {"single": {"0": 28444, "1": 45044, "2": 64775, "3": 73608, "4": 82253, "5": 91949}, "partnered": {"0": 45044, "1": 64775, "2": 73608, "3": 82253, "4": 91949, "5": 99341}};
  var ADD_PER_DEP = 8192;

  var appType = 'single';

  var btnSingle = document.querySelector('.he-seg__btn[data-app="single"]');
  var btnPartnered = document.querySelector('.he-seg__btn[data-app="partnered"]');

  var elDeps = document.getElementById('heDependents');
  var elIncome = document.getElementById('heIncome');
  var elFreq = document.getElementById('heIncomeFreq');
  var elSavings = document.getElementById('heSavings');
  var elAssets = document.getElementById('heAssets');
  var elReset = document.getElementById('heReset');

  var elStatus = document.getElementById('heStatus');
  var elStatusText = document.getElementById('heStatusText');
  var elSavingsNote = document.getElementById('heSavingsNote');
  var elThresholdLabel = document.getElementById('heThresholdLabel');
  var elThresholdValue = document.getElementById('heThresholdValue');
  var elAnnualIncome = document.getElementById('heAnnualIncome');
  var elSavingsAssets = document.getElementById('heSavingsAssets');

  if (!btnSingle || !btnPartnered || !elDeps || !elIncome || !elFreq) return;

  function setAppType(next) {
    appType = next;
    btnSingle.classList.toggle('is-active', next === 'single');
    btnPartnered.classList.toggle('is-active', next === 'partnered');
    update();
  }

  btnSingle.addEventListener('click', function () { setAppType('single'); });
  btnPartnered.addEventListener('click', function () { setAppType('partnered'); });

  function getIncomeAnnualised() {
    var income = toNumber(elIncome.value);
    var freq = elFreq.value;
    if (freq === 'week') return Math.round(income * 52);
    if (freq === 'fortnight') return Math.round(income * 26);
    return Math.round(income);
  }

  function thresholdFor(type, deps) {
    var baseMap = THRESHOLDS[type];
    var d = Math.min(deps, 5);
    var base = baseMap[d] || 0;
    if (deps > 5) {
      base = base + (deps - 5) * ADD_PER_DEP;
    }
    return Math.round(base);
  }

  function update() {
    var deps = clampInt(elDeps.value);
    elDeps.value = deps;

    var annualIncome = getIncomeAnnualised();
    var savings = toNumber(elSavings ? elSavings.value : 0);
    var assets = toNumber(elAssets ? elAssets.value : 0);
    var savingsAssets = Math.round(savings + assets);

    var threshold = thresholdFor(appType, deps);

    // labels
    var typeLabel = appType === 'partnered' ? 'Partnered' : 'Single';
    elThresholdLabel.textContent = 'Income threshold (' + typeLabel + ', ' + deps + ' dependents)';
    elThresholdValue.textContent = fmtMoney(threshold);
    elAnnualIncome.textContent = fmtMoney(annualIncome);
    elSavingsAssets.textContent = fmtMoney(savingsAssets);

    if (savings > 0) {
      elSavingsNote.hidden = false;
    } else {
      elSavingsNote.hidden = true;
    }

    // status
    if (annualIncome <= 0) {
      elStatus.textContent = 'Enter your details';
      elStatusText.textContent = 'Enter your details to see how your income compares with the income thresholds.';
      return;
    }

    if (annualIncome <= threshold) {
      elStatus.textContent = 'Under the income threshold';
      elStatusText.textContent = 'Based on what you entered, your income is under the income threshold. Legal aid still depends on your full circumstances, including hardship factors.';
    } else {
      elStatus.textContent = 'Over the income threshold (hardship may still apply)';
      elStatusText.textContent = 'Based on what you entered, your income is over the income threshold. You may still qualify on hardship grounds, and Legal Aid can consider savings, assets, and other factors.';
    }
  }

  function resetAll() {
    setAppType('single');
    elDeps.value = 0;
    elIncome.value = 0;
    elFreq.value = 'year';
    if (elSavings) elSavings.value = 0;
    if (elAssets) elAssets.value = 0;
    var ownHome = document.getElementById('heOwnHome');
    if (ownHome) ownHome.checked = false;
    update();
  }

  if (elReset) elReset.addEventListener('click', resetAll);

  [elDeps, elIncome, elFreq, elSavings, elAssets].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  update();
})();
