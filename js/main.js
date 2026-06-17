const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const forms = document.querySelectorAll("[data-form]");

const setHeaderState = () => {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (nav) {
  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });
}

const animateCounter = (counter) => {
  if (counter.dataset.done === "true") return;

  const target = Number(counter.dataset.target || "0");
  const prefix = counter.dataset.prefix || "";
  const suffix = counter.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    counter.textContent = `${prefix}${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.dataset.done = "true";
    }
  };

  requestAnimationFrame(tick);
};

const revealItems = document.querySelectorAll("[data-reveal]");
const counters = document.querySelectorAll("[data-counter]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
    revealObserver.observe(item);
  });

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counters.forEach(animateCounter);
}

forms.forEach((form) => {
  const formNote = form.querySelector("[data-form-note]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const data = new FormData(form);
    const lines = [
      "Nuova richiesta di preventivo dal sito RIM Multiservizi",
      "",
      `Nome: ${data.get("nome")}`,
      `Telefono: ${data.get("telefono")}`,
      `Email: ${data.get("email")}`,
      `Città: ${data.get("citta")}`,
      `Servizio richiesto: ${data.get("servizio")}`,
      "",
      "Descrizione:",
      data.get("descrizione")
    ];

    const subject = encodeURIComponent(`Richiesta preventivo - ${data.get("servizio")}`);
    const bodyText = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:rim.multiservizi@gmail.com?subject=${subject}&body=${bodyText}`;

    if (formNote) {
      formNote.textContent = "Email pronta: controlla il tuo programma di posta per inviare la richiesta.";
    }
  });
});

const cookieBanner = document.querySelector("[data-cookie-banner]");
const cookiePreferences = document.querySelector("[data-cookie-preferences]");
const cookieCustomize = document.querySelector("[data-cookie-customize]");
const cookieAccept = document.querySelector("[data-cookie-accept]");
const cookieReject = document.querySelector("[data-cookie-reject]");
const cookieSave = document.querySelector("[data-cookie-save]");
const cookieAnalytics = document.querySelector("[data-cookie-analytics]");
const cookieManageLinks = document.querySelectorAll("[data-cookie-manage]");

const openCookiePreferences = () => {
  cookieBanner?.removeAttribute("hidden");
  cookiePreferences?.removeAttribute("hidden");
  cookieBanner?.querySelector("[data-cookie-accept], [data-cookie-reject], [data-cookie-save]")?.focus();
};

const saveCookieChoice = (choice) => {
  localStorage.setItem("rimCookieConsent", JSON.stringify(choice));
  cookieBanner?.setAttribute("hidden", "");
  cookiePreferences?.setAttribute("hidden", "");
};

if (cookieBanner && !localStorage.getItem("rimCookieConsent")) {
  cookieBanner.removeAttribute("hidden");
}

cookieAccept?.addEventListener("click", () => {
  saveCookieChoice({ necessary: true, analytics: true, choice: "accepted" });
});

cookieReject?.addEventListener("click", () => {
  saveCookieChoice({ necessary: true, analytics: false, choice: "rejected" });
});

cookieCustomize?.addEventListener("click", () => {
  cookiePreferences?.toggleAttribute("hidden");
});

cookieSave?.addEventListener("click", () => {
  saveCookieChoice({
    necessary: true,
    analytics: Boolean(cookieAnalytics?.checked),
    choice: "custom"
  });
});

cookieManageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openCookiePreferences();
  });
});
