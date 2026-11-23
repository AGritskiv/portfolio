"use strict";

/* =========================================================
   1. ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА (RU / EN)
   ========================================================= */

const LANG_KEY = "portfolio-lang"; // ключ для localStorage
const langButtons = document.querySelectorAll(".lang-btn");

/**
 * Применяет язык ко всем элементам с data-ru / data-en
 * @param {"ru"|"en"} lang
 */
function applyLanguage(lang) {
  // 1) Меняем текст у всех элементов с data-ru / data-en
  document.querySelectorAll("[data-ru][data-en]").forEach((el) => {
    const text = el.dataset[lang];
    if (text !== undefined) {
      el.textContent = text;
    }
  });

  // 2) Меняем атрибут lang у <html>
  document.documentElement.lang = lang;

  // 3) Меняем подсказки (placeholder) у полей формы
  const placeholders = {
    ru: {
      name: "Иван Иванов",
      email: "you@example.com",
      message: "Ваше сообщение...",
    },
    en: {
      name: "John Smith",
      email: "you@example.com",
      message: "Your message...",
    },
  };
  const ph = placeholders[lang];
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  if (nameInput) nameInput.placeholder = ph.name;
  if (emailInput) emailInput.placeholder = ph.email;
  if (messageInput) messageInput.placeholder = ph.message;

  // 4) Обновляем состояние кнопок
  langButtons.forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  // 5) Сохраняем выбор
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    /* localStorage может быть недоступен — игнорируем */
  }

  // 6) Перерисовываем тексты ошибок формы под выбранный язык
  if (typeof refreshFormMessages === "function") {
    refreshFormMessages();
  }
}

// Навешиваем обработчики на кнопки RU / EN
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

// Определяем язык при загрузке:
// 1) сохранённый в localStorage, 2) язык браузера, 3) "ru"
function detectInitialLanguage() {
  let saved = null;
  try {
    saved = localStorage.getItem(LANG_KEY);
  } catch (e) { /* ignore */ }

  if (saved === "ru" || saved === "en") return saved;

  const browserLang = (navigator.language || "ru").toLowerCase();
  return browserLang.startsWith("en") ? "en" : "ru";
}

/* =========================================================
   2. МОБИЛЬНОЕ МЕНЮ
   ========================================================= */

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.classList.toggle("is-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.classList.remove("is-active");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* =========================================================
   3. КНОПКА "НАВЕРХ"
   ========================================================= */

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("is-visible", window.scrollY > 400);
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =========================================================
   4. ГОД В ФУТЕРЕ
   ========================================================= */

document.getElementById("year").textContent = new Date().getFullYear();

/* =========================================================
   5. ВАЛИДАЦИЯ ФОРМЫ (с поддержкой RU / EN)
   ========================================================= */

const form = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

const FORM_MESSAGES = {
  ru: {
    name: "Введите имя (минимум 2 символа).",
    email: "Введите корректный email.",
    message: "Сообщение должно быть не короче 10 символов.",
    success: "Спасибо! Ваше сообщение отправлено.",
  },
  en: {
    name: "Please enter your name (at least 2 characters).",
    email: "Please enter a valid email.",
    message: "Message must be at least 10 characters.",
    success: "Thank you! Your message has been sent.",
  },
};

let currentLang = "ru"; // обновляется в applyLanguage

/**
 * Возвращает текущий язык (для сообщений формы)
 */
function getCurrentLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ru" || saved === "en") return saved;
  } catch (e) { /* ignore */ }
  return currentLang;
}

/**
 * Показывает ошибку под полем
 */
function setError(fieldName, message) {
  const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (errorEl) errorEl.textContent = message || "";
}

/**
 * Простая проверка email
 */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Перерисовывает сообщения формы при смене языка
 * (если сообщение об успехе уже показано — обновляем его текст)
 */
function refreshFormMessages() {
  const lang = getCurrentLang();
  currentLang = lang;
  // Очищаем ошибки при смене языка, чтобы не показывать на другом языке
  setError("name", "");
  setError("email", "");
  setError("message", "");
  // Если было показано сообщение об успехе — переводим его
  if (formSuccess.textContent) {
    formSuccess.textContent = FORM_MESSAGES[lang].success;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const lang = getCurrentLang();
  const messages = FORM_MESSAGES[lang];

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  let isValid = true;

  setError("name", "");
  setError("email", "");
  setError("message", "");
  formSuccess.textContent = "";

  if (name.length < 2) {
    setError("name", messages.name);
    isValid = false;
  }
  if (!isValidEmail(email)) {
    setError("email", messages.email);
    isValid = false;
  }
  if (message.length < 10) {
    setError("message", messages.message);
    isValid = false;
  }

  if (!isValid) return;

  formSuccess.textContent = messages.success;
  form.reset();
});

/* =========================================================
   6. ПЛАВНАЯ ПРОКРУТКА С УЧЁТОМ ШАПКИ
   ========================================================= */

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (targetId === "#" || targetId.length < 2) return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const headerOffset = 68;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: targetPosition, behavior: "smooth" });
  });
});

/* =========================================================
   7. ПОЯВЛЕНИЕ СЕКЦИЙ ПРИ ПРОКРУТКЕ
   ========================================================= */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".section, .skill-card, .project-card").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});

/* =========================================================
   8. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
   ========================================================= */

applyLanguage(detectInitialLanguage());