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
  progress.style.width = `${percentage}%`;
  header.classList.toggle("scrolled", window.scrollY > 10);
}

updateScrollUI();
window.addEventListener("scroll", updateScrollUI, { passive: true });

function closeMenu() {
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "فتح القائمة");
  document.body.style.overflow = ""; document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "إغلاق القائمة" : "فتح القائمة");
  document.body.style.overflow = isOpen ? "hidden" : ""; document.body.classList.toggle("menu-open", isOpen);
});

menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

if (!reduceMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, itemObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        itemObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    sectionLinks.forEach((link) => link.setAttribute("aria-current", String(link.getAttribute("href") === `#${active.target.id}`)));
  }, { rootMargin: "-35% 0px -55%", threshold: [0.05, 0.2, 0.45] });
  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
}

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
  const glow = document.querySelector(".cursor-glow");
  window.addEventListener("pointermove", (event) => {
    glow.style.opacity = "1";
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.11;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.11;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener("pointerleave", () => { button.style.transform = ""; });
  });

  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty("--hero-x", ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
    hero.style.setProperty("--hero-y", ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-x", "0");
    hero.style.setProperty("--hero-y", "0");
  });

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${(-y * 2.8).toFixed(2)}deg) rotateY(${(x * 3.2).toFixed(2)}deg) translateY(-5px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

const form = document.querySelector(".contact-form");
const status = document.querySelector(".form-status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (form.classList.contains("is-sending")) return;

  form.classList.add("is-sending");
  status.textContent = "جارٍ إرسال رسالتك…";
  status.className = "form-status";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Form submission failed");
    form.reset();
    status.textContent = "تم إرسال رسالتك بنجاح. شكرًا لتواصلك.";
    status.className = "form-status success";
  } catch (error) {
    status.textContent = "تعذر إرسال الرسالة حاليًا. يمكنك التواصل عبر البريد الإلكتروني مباشرة.";
    status.className = "form-status error";
  } finally {
    form.classList.remove("is-sending");
  }
});

/* Courses & certificates: full-certificate viewer */
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

certificateCards.forEach((card) => {
  card.addEventListener("click", () => openCertificate(card));
});

certificateModal?.querySelectorAll("[data-close-certificate]").forEach((element) => {
  element.addEventListener("click", closeCertificate);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && certificateModal?.classList.contains("is-open")) {
    closeCertificate();
  }
});

// --- Reliable top navigation ---
(() => {
  const topButtons = [
    document.querySelector('.brand[href="#top"]'),
    document.querySelector('#back-to-top')
  ].filter(Boolean);

  const goToTop = (event) => {
    event.preventDefault();
    // Native smooth scroll is more reliable for local files and simple static hosting.
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    // Fallback for older/mobile webviews.
    setTimeout(() => {
      if (window.scrollY > 5) window.scrollTo(0, 0);
    }, 900);
  };

  topButtons.forEach(el => el.addEventListener('click', goToTop, { passive: false }));

  const back = document.querySelector('#back-to-top');
  const toggleBack = () => {
    if (!back) return;
    back.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', toggleBack, { passive: true });
  toggleBack();
})();
