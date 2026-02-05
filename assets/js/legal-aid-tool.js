(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const toggle = $("#heCheckerToggle");
  const panel  = $("#heCheckerPanel");
  const modal  = $("#heDisclaimer");
  const backdrop = modal ? $(".he-modal-backdrop", modal) : null;
  const ack = $("#heDisclaimerAck");
  const btnCancel = $("#heDisclaimerCancel");
  const btnContinue = $("#heDisclaimerContinue");

  const segBtns = $$(".he-seg-btn");
  let appType = "single";

  const elDeps = $("#heDependents");
  const elIncome = $("#heIncome");
  const elFreq = $("#heIncomeFreq");
  const elSavings = $("#heSavings");
  const elAssets = $("#heAssets");

  const out = $("#heOutcome");
  const outSub = $("#heOutcomeSub");
  const thLabel = $("#heThresholdLabel");
  const thVal = $("#heThresholdValue");
  const annVal = $("#heAnnualised");
  const diffVal = $("#heDifference");
  const savingsNote = $("#heSavingsNote");
  const btnReset = $("#heReset");

  const fmt = (n) => {
    const v = Math.round(Number(n || 0));
    return "$" + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const thresholds = {
    single:   [28444, 45044, 64775, 73608, 82253, 91949],
    partnered:[45044, 64775, 73608, 82253, 91949, 99341]
  };
  const extraPerDep = 8192;

  const getThreshold = (type, deps) => {
    const d = Math.max(0, Math.floor(Number(deps||0)));
    if (d <= 5) return thresholds[type][d];
    return thresholds[type][5] + (d - 5) * extraPerDep;
  };

  const annualise = (income, freq) => {
    const v = Number(income || 0);
    if (!v) return 0;
    if (freq === "week") return v * 52;
    if (freq === "fortnight") return v * 26;
    return v;
  };

  const setModalOpen = (open) => {
    if (!modal) return;
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    modal.classList.toggle("is-open", open);
    if (open) {
      if (ack) ack.checked = false;
      if (btnContinue) btnContinue.disabled = true;
      document.body.classList.add("he-modal-open");
    } else {
      document.body.classList.remove("he-modal-open");
    }
  };

  const openChecker = () => {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    $("#heCheckerDisclosure")?.classList.add("is-open");
    // focus first input for accessibility
    setTimeout(()=>{ elIncome && elIncome.focus(); }, 50);
  };

  const closeChecker = () => {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    $("#heCheckerDisclosure")?.classList.remove("is-open");
  };

  const requestOpen = () => {
    // Always show disclaimer when opening
    setModalOpen(true);
  };

  const compute = () => {
    const deps = Math.max(0, Math.floor(Number(elDeps?.value || 0)));
    const incomeAnnual = annualise(elIncome?.value || 0, elFreq?.value || "year");
    const threshold = getThreshold(appType, deps);

    // labels
    if (thLabel) thLabel.textContent = `Income threshold (${appType === "partnered" ? "Partnered" : "Single"}, ${deps} dependent${deps===1?"":"s"})`;
    if (thVal) thVal.textContent = fmt(threshold);
    if (annVal) annVal.textContent = fmt(incomeAnnual);

    // savings note visibility
    const savings = Number(elSavings?.value || 0);
    if (savingsNote) savingsNote.hidden = !(savings > 0);

    if (!incomeAnnual) {
      if (out) out.textContent = "Enter your details";
      if (outSub) outSub.textContent = "We will show how your income compares with the income thresholds.";
      if (diffVal) diffVal.textContent = "$0 under threshold";
      if (out) {
        out.classList.remove("is-under","is-over");
      }
      return;
    }

    const diff = Math.abs(threshold - incomeAnnual);
    const isUnder = incomeAnnual <= threshold;

    if (diffVal) diffVal.textContent = `${fmt(diff)} ${isUnder ? "under threshold" : "over threshold"}`;

    if (out) {
      out.textContent = isUnder ? "Under the income threshold" : "Over the income threshold (hardship may still apply)";
      out.classList.toggle("is-under", isUnder);
      out.classList.toggle("is-over", !isUnder);
    }

    if (outSub) {
      outSub.textContent = isUnder
        ? "Based on what you entered, your income is under the income threshold. Legal aid still depends on your full circumstances, including hardship factors."
        : "Based on what you entered, your income is over the income threshold. You may still qualify on hardship grounds, and Legal Aid can consider savings, assets, and other factors.";
    }
  };

  const wire = () => {
    if (segBtns.length) {
      segBtns.forEach(btn=>{
        btn.addEventListener("click", ()=>{
          segBtns.forEach(b=>b.classList.remove("is-active"));
          btn.classList.add("is-active");
          appType = btn.dataset.type || "single";
          compute();
        });
      });
    }

    [elDeps, elIncome, elFreq, elSavings, elAssets].forEach(el=>{
      if (!el) return;
      el.addEventListener("input", compute);
      el.addEventListener("change", compute);
    });

    if (btnReset) {
      btnReset.addEventListener("click", ()=>{
        if (elDeps) elDeps.value = 0;
        if (elIncome) elIncome.value = "";
        if (elFreq) elFreq.value = "year";
        if (elSavings) elSavings.value = 0;
        if (elAssets) elAssets.value = 0;
        compute();
      });
    }

    const clickToggle = () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeChecker();
      } else {
        requestOpen();
      }
    };

    if (toggle) {
      toggle.addEventListener("click", clickToggle);
      toggle.addEventListener("keydown", (e)=>{
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          clickToggle();
        }
      });
    }

    if (ack && btnContinue) {
      ack.addEventListener("change", ()=>{
        btnContinue.disabled = !ack.checked;
      });
    }

    if (btnCancel) btnCancel.addEventListener("click", ()=> setModalOpen(false));
    if (backdrop) backdrop.addEventListener("click", ()=> setModalOpen(false));

    if (btnContinue) btnContinue.addEventListener("click", ()=>{
      if (!ack || !ack.checked) return;
      setModalOpen(false);
      openChecker();
    });

    // initial compute
    compute();
  };

  document.addEventListener("DOMContentLoaded", wire);
})();
