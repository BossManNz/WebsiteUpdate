(function () {
  const $ = (id) => document.getElementById(id);

  const dependentsEl = $("heDependents");
  const incomeEl = $("heIncome");
  const incomeFreqEl = $("heIncomeFreq");
  const savingsEl = $("heSavings");
  const assetsEl = $("heAssets");

  const outcomeEl = $("heOutcome");
  const outcomeSubEl = $("heOutcomeSub");
  const thresholdLabelEl = $("heThresholdLabel");
  const thresholdValueEl = $("heThresholdValue");
  const annualIncomeEl = $("heAnnualIncome");
  const differenceEl = $("heDifference");
  const savingsNoteEl = $("heSavingsNote");

  const resetBtn = $("heReset");

  // Disclaimer gate (require acknowledgement before enabling the tool)
  const modal = $("heDisclaimerModal");
  const ack = $("heDisclaimerAck");
  const contBtn = $("heDisclaimerClose");

  const setToolEnabled = (enabled) => {
    // disable all inputs/selects/buttons inside the checker settings area
    const scope = document.querySelector(".he-settings");
    if (!scope) return;
    scope.querySelectorAll("input, select, button").forEach((el) => {
      if (el.id === "heDisclaimerAck" || el.id === "heDisclaimerClose") return;
      el.disabled = !enabled;
    });
  };

  const openModal = () => {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("he-modal-open");
    setToolEnabled(false);
    if (contBtn) contBtn.disabled = true;
    if (ack) ack.checked = false;
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("he-modal-open");
    setToolEnabled(true);
    try { localStorage.setItem("he_la_tool_ack", String(Date.now())); } catch (e) {}
    // run once to refresh outcome after enabling
    update();
  };

  const acknowledgedRecently = () => {
    try {
      const v = localStorage.getItem("he_la_tool_ack");
      if (!v) return false;
      const ts = parseInt(v, 10);
      if (!Number.isFinite(ts)) return false;
      // 30 days
      return (Date.now() - ts) < (30 * 24 * 60 * 60 * 1000);
    } catch (e) { return false; }
  };


  const segBtns = document.querySelectorAll(".he-segment__btn");
  let appType = "single";

  const THRESHOLDS = {
    single: [28444, 45044, 64775, 73608, 82253, 91949],
    partnered: [45044, 64775, 73608, 82253, 91949, 99341],
  };

  const EXTRA_DEPENDENT = 8192;

  const clampInt = (n, min, max) => {
    const x = parseInt(n, 10);
    if (Number.isNaN(x)) return min;
    return Math.max(min, Math.min(max, x));
  };

  const toNumber = (val) => {
    const n = parseFloat((val || "").toString().replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const money = (n) => {
    const x = Math.round(n);
    return x.toLocaleString(undefined, { style: "currency", currency: "NZD", maximumFractionDigits: 0 });
  };

  const annualiseIncome = (raw, freq) => {
    if (!raw) return 0;
    if (freq === "week") return raw * 52;
    if (freq === "fortnight") return raw * 26;
    return raw;
  };

  const computeThreshold = (type, deps) => {
    const arr = THRESHOLDS[type] || THRESHOLDS.single;
    if (deps <= 5) return arr[deps];
    return arr[5] + (deps - 5) * EXTRA_DEPENDENT;
  };

  const updateIncomeHelp = () => {
    const help = document.getElementById("heIncomeHelp");
    if (!help) return;
    if (appType === "partnered") {
      help.textContent = "Enter your combined total income. Include your partner’s income too.";
    } else {
      help.textContent = "Enter your best estimate.";
    }
  };

  const setOutcome = (state, headline, subline) => {
    outcomeEl.classList.remove("is-over", "is-under");
    if (state) outcomeEl.classList.add(state);
    outcomeEl.textContent = headline;
    outcomeSubEl.textContent = subline;
  };

  const update = () => {
    const deps = clampInt(dependentsEl?.value ?? 0, 0, 99);
    if (dependentsEl) dependentsEl.value = deps;

    const incomeRaw = toNumber(incomeEl?.value);
    const freq = incomeFreqEl?.value || "year";
    const annualIncome = annualiseIncome(incomeRaw, freq);

    const threshold = computeThreshold(appType, deps);

    thresholdLabelEl.textContent = `Income threshold (${appType === "partnered" ? "Partnered" : "Single"}, ${deps} dependents)`;
    thresholdValueEl.textContent = money(threshold);
    annualIncomeEl.textContent = money(annualIncome);

    // Difference (how far over or under)
    const diff = annualIncome - threshold;
    const abs = Math.abs(diff);

    if (!incomeRaw) {
      differenceEl.textContent = money(0);
      setOutcome(null, "Enter your details", "Enter your details to see how your income compares with the income thresholds.");
    } else if (diff <= 0) {
      differenceEl.textContent = `${money(abs)} under threshold`;
      setOutcome(
        "is-under",
        "Under the income threshold",
        "Based on what you entered, your income is under the income threshold. Legal aid still depends on your full circumstances, including hardship factors."
      );
    } else {
      differenceEl.textContent = `${money(abs)} over threshold`;
      setOutcome(
        "is-over",
        "Over the income threshold (hardship may still apply)",
        "Based on what you entered, your income is over the income threshold. You may still qualify on hardship grounds, and Legal Aid can consider savings, assets, and other factors."
      );
    }

    // Savings note
    const savings = toNumber(savingsEl?.value);
    if (savings > 0) {
      savingsNoteEl.hidden = false;
    } else {
      savingsNoteEl.hidden = true;
    }
  };

  const onAnyInput = () => update();

  segBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      segBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      appType = btn.getAttribute("data-apptype") || "single";
      updateIncomeHelp();
      update();
    });
  });

  [dependentsEl, incomeEl, incomeFreqEl, savingsEl, assetsEl].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", onAnyInput);
    el.addEventListener("change", onAnyInput);
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (dependentsEl) dependentsEl.value = 0;
      if (incomeEl) incomeEl.value = "";
      if (incomeFreqEl) incomeFreqEl.value = "year";
      if (savingsEl) savingsEl.value = "";
      if (assetsEl) assetsEl.value = "";
      const ownHome = document.getElementById("heOwnHome");
      if (ownHome) ownHome.checked = false;

      // Reset to Single
      appType = "single";
      segBtns.forEach((b) => b.classList.remove("is-active"));
      const first = document.querySelector('.he-segment__btn[data-apptype="single"]');
      if (first) first.classList.add("is-active");

      updateIncomeHelp();
      update();
    });
  }


  // Modal listeners
  if (ack && contBtn) {
    ack.addEventListener("change", () => {
      contBtn.disabled = !ack.checked;
    });
  }
  if (contBtn) {
    contBtn.addEventListener("click", () => {
      if (ack && !ack.checked) return;
      closeModal();
    });
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "true") {
        // Do not allow closing without acknowledgement
        e.preventDefault();
      }
    });
  }

  // Gate the tool unless acknowledged recently
  if (!acknowledgedRecently()) {
    openModal();
  } else {
    setToolEnabled(true);
  }


  updateIncomeHelp();
  update();
})();
