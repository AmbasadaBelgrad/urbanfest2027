/* UrbanFest 2027: multilingual support form, submitted directly to Formspree. */
(() => {
  "use strict";

  const language = (document.documentElement.lang || "en").slice(0, 2);
  const strings = {
    en: {
      submitting: "Sending…",
      success: "Thank you! Your message has been sent. We'll get back to you.",
      error: "We couldn't send your message. Please try again, or email us directly.",
      rateLimit: "Too many attempts. Please wait a few minutes and try again.",
      validation: "Please check the form fields and try again."
    },
    sr: {
      submitting: "Šaljemo…",
      success: "Hvala! Vaša poruka je poslata. Javićemo vam se.",
      error: "Poruka nije poslata. Pokušajte ponovo ili nam pišite direktno na imejl.",
      rateLimit: "Previše pokušaja. Sačekajte nekoliko minuta pa pokušajte ponovo.",
      validation: "Proverite uneta polja i pokušajte ponovo."
    },
    ru: {
      submitting: "Отправляем…",
      success: "Спасибо! Сообщение отправлено. Мы свяжемся с вами.",
      error: "Не удалось отправить сообщение. Попробуйте ещё раз или напишите нам на почту.",
      rateLimit: "Слишком много попыток. Подождите несколько минут и повторите отправку.",
      validation: "Проверьте заполненные поля и попробуйте ещё раз."
    }
  };
  const text = strings[language] || strings.en;

  function init() {
    const form = document.getElementById("uf-support-form");
    if (!form) return;

    const topic = form.querySelector('select[name="topic"]');
    const status = form.querySelector(".uf-contact-status");
    const submit = form.querySelector('button[type="submit"]');
    if (!topic || !status || !submit) return;
    const initialButtonText = submit.textContent;
    let sending = false;

    document.querySelectorAll("[data-support-topic]").forEach((link) => {
      link.addEventListener("click", () => {
        const selected = link.getAttribute("data-support-topic");
        if ([...topic.options].some((option) => option.value === selected)) {
          topic.value = selected;
        }
      });
    });

    function setStatus(message, kind) {
      status.hidden = false;
      status.textContent = message;
      status.dataset.state = kind;
    }

    function setSending(isSending) {
      sending = isSending;
      submit.disabled = isSending;
      submit.textContent = isSending ? text.submitting : initialButtonText;
      form.setAttribute("aria-busy", String(isSending));
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;

      const data = new FormData(form);
      const contact = String(data.get("contact") || "").trim();
      const selectedTopic = String(data.get("topic") || "");
      const category = topic.options[topic.selectedIndex]?.textContent?.trim() || "Support";
      // Formspree uses the "email" field for Reply-To. Telegram usernames remain in "contact".
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
        data.set("email", contact);
      }
      data.set("subject", "UrbanFest 2027: " + category);
      data.set("language", language);
      data.set("source_page", window.location.pathname);

      setSending(true);
      status.hidden = true;
      status.textContent = "";
      status.dataset.state = "";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data
        });

        let result = null;
        try {
          result = await response.json();
        } catch (_) {
          // The HTTP status is still used if the response body cannot be parsed.
        }

        if (!response.ok || result?.ok === false ||
            (Array.isArray(result?.errors) && result.errors.length > 0)) {
          const problem = new Error("Formspree submission unsuccessful");
          problem.status = response.status;
          throw problem;
        }

        form.reset();
        setStatus(form.dataset.afterSubmit || text.success, "success");

        // Never send names, contact details, or message content to GA4.
        if (typeof window.gtag === "function") {
          window.gtag("event", "support_contact_submit", {
            support_type: selectedTopic,
            form_id: "urbanfest_support"
          });
        }
      } catch (error) {
        const message = error.status === 429 ? text.rateLimit :
                        (error.status === 400 || error.status === 422) ? text.validation :
                        text.error;
        setStatus(message, "error");
      } finally {
        setSending(false);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
