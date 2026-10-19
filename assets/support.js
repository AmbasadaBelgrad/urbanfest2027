/* UrbanFest 2027: prefill support enquiries as email drafts. No server-side form endpoint. */
(() => {
  "use strict";
  function init() {
    const form = document.getElementById("uf-support-form");
    if (!form) return;
    const topic = form.querySelector('select[name="topic"]');
    const status = form.querySelector(".uf-contact-status");
    const recipient = "ambasadazaurbanizam@gmail.com";

    document.querySelectorAll("[data-support-topic]").forEach((link) => {
      link.addEventListener("click", () => {
        const selected = link.getAttribute("data-support-topic");
        if ([...topic.options].some((option) => option.value === selected)) {
          topic.value = selected;
        }
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const lang = (document.documentElement.lang || "en").slice(0, 2);
      const name = String(data.get("name") || "").trim();
      const contact = String(data.get("contact") || "").trim();
      const organisation = String(data.get("organisation") || "").trim();
      const message = String(data.get("message") || "").trim();
      const category = topic.options[topic.selectedIndex]?.textContent?.trim() || "Enquiry";
      if (!name || !contact || !message || !topic.value) return;

      const fields = {
        en: ["Name", "Contact", "Organisation", "Topic", "Message"],
        sr: ["Ime", "Kontakt", "Organizacija", "Tema", "Poruka"],
        ru: ["Имя", "Контакт", "Организация", "Тема", "Сообщение"]
      }[lang] || ["Name", "Contact", "Organisation", "Topic", "Message"];
      const body = [
        fields[0] + ": " + name,
        fields[1] + ": " + contact,
        organisation ? fields[2] + ": " + organisation : null,
        fields[3] + ": " + category,
        "",
        fields[4] + ":",
        message
      ].filter((line) => line !== null).join("\n");
      const subject = "UrbanFest 2027: " + category;
      const mailto = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      // This is only an email-draft open, not a completed submission.
      if (typeof window.gtag === "function") {
        window.gtag("event", "support_contact_prepare", {support_type: topic.value});
      }
      if (status) {
        status.hidden = false;
        status.textContent = form.getAttribute("data-after-submit") || "Please send the prepared email from your mail app.";
      }
      window.location.href = mailto;
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {once:true});
  } else {
    init();
  }
})();
