(function () {
  const form = document.getElementById('contactForm');
  const modal = document.getElementById('confirmModal');
  const acceptBtn = document.getElementById('acceptConfirm');
  const cancelBtn = document.getElementById('cancelConfirm');
  const closeBtn = modal.querySelector('.modal__close');
  const backdrop = modal.querySelector('.modal__backdrop');
  const submitBtn = form.querySelector('button[type="submit"]');

  const WEB3_ENDPOINT = 'https://api.web3forms.com/submit';
  let pendingFormData = null;
  let toastTimer = null;

  // simple toast
  function showToast(msg, type = 'success', ms = 3000) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.className = `toast ${type}`;
    t.textContent = msg;
    // force reflow to restart transition
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    acceptBtn.focus();
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function disableSubmit(disabled) {
    if (!submitBtn) return;
    submitBtn.disabled = disabled;
    submitBtn.style.opacity = disabled ? '0.7' : '';
    submitBtn.style.pointerEvents = disabled ? 'none' : '';
  }

  // Intercept submit to show confirm first
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const key = form.querySelector('input[name="access_key"]')?.value?.trim();
    if (!key) {
      showToast('Missing Web3Forms access key', 'error', 4000);
      return;
    }

    pendingFormData = new FormData(form);

    // helpful defaults
    if (!pendingFormData.get('subject')) pendingFormData.set('subject', 'Website contact form submission');
    if (!pendingFormData.get('from_name')) pendingFormData.set('from_name', 'Hine Eagle Website');

    // so you can reply from your inbox
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput && emailInput.value) pendingFormData.set('replyto', emailInput.value);

    openModal();
  });

  // User confirms send
  acceptBtn.addEventListener('click', async function () {
    if (!pendingFormData) return;

    try {
      disableSubmit(true);
      // small trace for debugging origins
      pendingFormData.set('_origin', window.location.origin || 'null');

      const res = await fetch(WEB3_ENDPOINT, { method: 'POST', body: pendingFormData });
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        showToast('Thanks, your message has been sent.', 'success');
        form.reset();
      } else {
        const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
        showToast(`Send failed. ${msg}`, 'error', 5000);
        console.error('Web3Forms response:', data);
      }
    } catch (err) {
      showToast('Network error sending your message.', 'error', 5000);
      console.error(err);
    } finally {
      pendingFormData = null;
      closeModal();        // close the confirm box after OK
      disableSubmit(false);
    }
  });

  // Cancel, X, or click outside
  function cancelAndClose() {
    pendingFormData = null;  // guarantees nothing sends
    closeModal();
  }
  [cancelBtn, closeBtn, backdrop].forEach(el => el.addEventListener('click', cancelAndClose));

  // Esc to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) cancelAndClose();
  });
})();
