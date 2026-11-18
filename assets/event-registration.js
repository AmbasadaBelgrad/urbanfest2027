(() => {
  'use strict';
  const form = document.querySelector('.event-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[role="status"]');
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = form.dataset.sending;
    try {
      const response = await fetch(form.action, {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      status.textContent = form.dataset.success;
      // Keep the button disabled after success to prevent duplicate applications.
    } catch (_) {
      status.textContent = form.dataset.error;
      button.disabled = false;
      sending = false;
    } finally {
      form.removeAttribute('aria-busy');
    }
  });
})();
