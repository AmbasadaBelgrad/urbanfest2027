/* UrbanFest 2027: registration and outbound link click events for GA4. */
(() => {
  "use strict";

  const registrationFormId = "1slLSATMFyt-E8ZCHkyF-YfPMIX1MEFKwfa-5wL1tldc";

  function trackLinkClicks(event) {
    if (typeof window.gtag !== "function") return;
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

    if (
      destination.hostname === "docs.google.com" &&
      destination.pathname.includes("/forms/d/" + registrationFormId)
    ) {
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

  document.addEventListener("click", trackLinkClicks);
})();
