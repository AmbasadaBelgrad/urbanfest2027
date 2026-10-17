/* UrbanFest 2027: optional, consent-based Google Analytics 4. */
(() => {
  "use strict";

  const measurementId = "G-C3VJ0NRSVP";
  const consentKey = "urbanfest_analytics_consent_v1";
  const registrationFormId = "1slLSATMFyt-E8ZCHkyF-YfPMIX1MEFKwfa-5wL1tldc";
  const copy = {
    en: {
      region: "Analytics consent",
      explanation: "May we use Google Analytics to understand site visits and registration clicks? You can decline; the site works without analytics.",
      accept: "Allow analytics",
      reject: "No thanks",
      settings: "Analytics settings"
    },
    sr: {
      region: "Saglasnost za analitiku",
      explanation: "Da li možemo da koristimo Google Analytics za praćenje poseta sajtu i klikova na prijavu? Možete odbiti; sajt radi i bez analitike.",
      accept: "Dozvoli analitiku",
      reject: "Ne, hvala",
      settings: "Podešavanja analitike"
    },
    ru: {
      region: "Согласие на аналитику",
      explanation: "Можно использовать Google Analytics, чтобы понимать посещаемость сайта и переходы к регистрации? Можно отказаться, сайт работает и без аналитики.",
      accept: "Разрешить аналитику",
      reject: "Нет, спасибо",
      settings: "Настройки аналитики"
    }
  };
  const language = (document.documentElement.lang || "en").slice(0, 2);
  const t = copy[language] || copy.en;

  let analyticsStarted = false;
  let banner = null;

  function readConsent() {
    try {
      return localStorage.getItem(consentKey);
    } catch (_) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(consentKey, value);
    } catch (_) {
      // Visitors with blocked storage can still choose for this page.
    }
  }

  function startAnalytics() {
    if (analyticsStarted) return;
    analyticsStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);

    const tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
  }

  function removeBanner() {
    if (banner) {
      banner.remove();
      banner = null;
    }
  }

  function setConsent(allowed) {
    const previouslyStarted = analyticsStarted;
    saveConsent(allowed ? "accepted" : "declined");
    removeBanner();
    if (allowed) {
      startAnalytics();
    } else if (previouslyStarted) {
      // Reload to stop an already-loaded Google tag after consent is withdrawn.
      location.reload();
    }
  }

  function makeButton(label, className, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", callback);
    return button;
  }

  function showBanner() {
    if (banner) return;
    banner = document.createElement("div");
    banner.className = "uf-analytics-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", t.region);

    const message = document.createElement("p");
    message.textContent = t.explanation;
    const buttons = document.createElement("div");
    buttons.className = "uf-analytics-actions";
    buttons.appendChild(makeButton(t.reject, "uf-analytics-reject", () => setConsent(false)));
    buttons.appendChild(makeButton(t.accept, "uf-analytics-accept", () => setConsent(true)));

    banner.appendChild(message);
    banner.appendChild(buttons);
    document.body.appendChild(banner);
  }

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = [
      ".uf-analytics-banner{position:fixed;z-index:1000;bottom:16px;left:16px;right:16px;max-width:640px;margin:0 auto;background:#fffaf7;color:#261123;border:1px solid rgba(38,17,35,.25);border-radius:14px;box-shadow:0 12px 38px rgba(38,17,35,.25);padding:18px 20px;font:400 14px/1.5 Geologica,Arial,sans-serif}",
      ".uf-analytics-banner p{margin:0 0 16px}",
      ".uf-analytics-actions{display:flex;gap:10px;flex-wrap:wrap}",
      ".uf-analytics-actions button{font:500 13px/1.2 Geologica,Arial,sans-serif;min-height:42px;padding:10px 18px;border-radius:999px;cursor:pointer}",
      ".uf-analytics-reject{background:transparent;color:#261123;border:1px solid #261123}",
      ".uf-analytics-accept{background:#db3e1d;color:white;border:1px solid #db3e1d}",
      ".uf-analytics-actions button:focus-visible,.uf-analytics-settings:focus-visible{outline:3px solid #8eb9c7;outline-offset:3px}",
      ".uf-analytics-settings{font:inherit;color:inherit;background:none;border:0;text-decoration:underline;cursor:pointer;padding:4px 0;margin-top:5px;opacity:.85}",
      "@media(max-width:560px){.uf-analytics-banner{left:10px;right:10px;bottom:10px;padding:14px 16px}.uf-analytics-actions button{flex:1}}"
    ].join("");
    document.head.appendChild(style);
  }

  function installSettingsButton() {
    const container = document.querySelector("footer .foot div:last-child") || document.querySelector("footer");
    if (!container) return;
    container.appendChild(document.createElement("br"));
    container.appendChild(makeButton(t.settings, "uf-analytics-settings", showBanner));
  }

  function trackLinkClicks(event) {
    if (!analyticsStarted || typeof window.gtag !== "function") return;
    const element = event.target instanceof Element ? event.target : event.target.parentElement;
    const link = element && element.closest("a[href]");
    if (!link) return;

    let destination;
    try {
      destination = new URL(link.href, location.href);
    } catch (_) {
      return;
    }
    if (!["http:", "https:"].includes(destination.protocol)) return;
    if (destination.origin === location.origin) return;

    if (destination.hostname === "docs.google.com" &&
        destination.pathname.includes("/forms/d/" + registrationFormId)) {
      const placement = link.closest(".hero") ? "hero" : link.closest(".register") ? "footer" : "other";
      window.gtag("event", "registration_click", {
        button_location: placement,
        link_url: destination.href
      });
    } else {
      window.gtag("event", "outbound_click", {
        link_domain: destination.hostname,
        link_url: destination.href
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    addStyles();
    installSettingsButton();
    document.addEventListener("click", trackLinkClicks);
    if (readConsent() === "accepted") {
      startAnalytics();
    } else if (readConsent() !== "declined") {
      showBanner();
    }
  });
})();
