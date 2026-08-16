/* Turki-CV mobile-safe script replacement
   Includes the original site's interactive behavior with the
   certificate-card initialization fixed and mobile menu made reliable. */

"use strict";

document.documentElement.classList.add("js");

const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress span");
const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector(".nav-menu");
const sectionLinks = [...document.querySelectorAll('.nav-menu > a[href^="#"]')];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${percentage}%`;
  if (header) header.classList.toggle("scrolled", window.scrollY > 10);
}

updateScrollUI();
window.addEventListener("scroll", updateScrollUI, { passive: true });

function closeMenu() {
  if (!menu || !menuButton) return;
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "فتح القائمة");
  document.body.style.overflow = "";
}

function toggleMenu() {
  if (!menu || !menuButton) return;
  const isOpen = menu.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "إغلاق القائمة" : "فتح القائمة");
  document.body.style.overflow = isOpen ? "hidden" : "";
}

menuButton?.addEventListener("click", toggleMenu);
menu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenu();
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) closeMenu();
}, { passive: true });

if (!reduceMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, itemObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        itemObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach(element => element.classList.add("is-visible"));
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const active = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!active) return;

    sectionLinks.forEach(link => {
      link.setAttribute(
        "aria-current",
        String(link.getAttribute("href") === `#${active.target.id}`)
      );
    });
  }, { rootMargin: "-35% 0px -55%", threshold: [0.05, 0.2, 0.45] });

  document.querySelectorAll("main section[id]").forEach(section => {
    sectionObserver.observe(section);
  });
}

/* Mouse/cursor animations intentionally removed in V21. */

/* Contact form -> WhatsApp */
const form = document.querySelector(".contact-form");
const status = document.querySelector(".form-status");
const WHATSAPP_NUMBER = "966558759593";

form?.addEventListener("submit", event => {
  event.preventDefault();
  if (form.classList.contains("is-sending")) return;

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const subject = String(data.get("subject") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !subject || !message) {
    if (status) { status.textContent = "فضلاً أكمل الحقول المطلوبة."; status.className = "form-status error"; }
    return;
  }

  const text = [
    "مرحبًا تركي،",
    "أرغب في التواصل معك من خلال موقعك.",
    "",
    `الاسم: ${name}`,
    `البريد: ${email}`,
    `الموضوع: ${subject}`,
    `الرسالة: ${message}`
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  form.classList.add("is-sending");
  if (status) { status.textContent = "جارٍ فتح واتساب…"; status.className = "form-status"; }

  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => {
    form.classList.remove("is-sending");
    if (status) { status.textContent = "تم تجهيز الرسالة لفتحها عبر واتساب."; status.className = "form-status success"; }
  }, 350);
});

/* Certificates - fixed initialization order */
const certificateCards = document.querySelectorAll(".certificate-card");
const certificateModal = document.querySelector("#certificate-modal");
const certificateModalImage = document.querySelector("#certificate-modal-image");
const certificateModalProvider = document.querySelector("#certificate-modal-provider");
const certificateModalTitle = document.querySelector("#certificate-modal-title");
const certificateModalDescription = document.querySelector("#certificate-modal-description");
const certificateModalDate = document.querySelector("#certificate-modal-date");
const certificateModalLevel = document.querySelector("#certificate-modal-level");
const certificateModalPdf = document.querySelector("#certificate-modal-pdf");

function openCertificate(card) {
  if (!certificateModal) return;

  certificateModalImage.src = card.dataset.image;
  certificateModalImage.alt = `شهادة ${card.dataset.title}`;
  certificateModalProvider.textContent = card.dataset.provider;
  certificateModalTitle.textContent = card.dataset.title;
  certificateModalDescription.textContent = card.dataset.description;
  certificateModalDate.textContent = card.dataset.date;
  certificateModalLevel.textContent = card.dataset.level;
  certificateModalPdf.href = card.dataset.pdf;

  certificateModal.classList.add("is-open");
  certificateModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeCertificate() {
  if (!certificateModal) return;

  certificateModal.classList.remove("is-open");
  certificateModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  certificateModalImage.removeAttribute("src");
}

certificateCards.forEach(card => {
  card.addEventListener("click", () => openCertificate(card));
});

certificateModal?.querySelectorAll("[data-close-certificate]")
  .forEach(element => element.addEventListener("click", closeCertificate));

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    certificateModal?.classList.contains("is-open")
  ) {
    closeCertificate();
  }
});

/* Top navigation / back-to-top — robust version */
(() => {
  const back = document.querySelector("#back-to-top");
  const topLinks = [...document.querySelectorAll('a[href="#top"]')];

  const goToTop = (event) => {
    event?.preventDefault();
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? "auto" : "smooth"
    });
    if (document.body.scrollTop) {
      document.body.scrollTo({
        top: 0,
        left: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }
  };

  topLinks.forEach(link => link.addEventListener("click", goToTop));
  back?.addEventListener("click", goToTop);

  const toggleBack = () => {
    if (!back) return;
    back.classList.toggle("show", window.scrollY > 450);
  };

  window.addEventListener("scroll", toggleBack, { passive: true });
  toggleBack();
})();

/* V23 — close mobile drawer when tapping outside it. */
document.addEventListener("click", (event) => {
  if (!menu || !menuButton || !menu.classList.contains("is-open")) return;
  if (menu.contains(event.target) || menuButton.contains(event.target)) return;
  closeMenu();
});
