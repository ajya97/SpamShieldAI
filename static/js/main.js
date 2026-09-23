/**
 * main.js
 * Handles: mobile navigation, sticky navbar state, and live health-check status.
 */
(function () {
  "use strict";

  /* ---------------- Mobile menu ---------------- */
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      hamburgerBtn.classList.toggle("is-open", isOpen);
      hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // Close mobile menu when a link inside it is clicked
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        hamburgerBtn.classList.remove("is-open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Theme toggle ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const themeToggleMobile = document.getElementById("theme-toggle-mobile");

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* localStorage unavailable — theme still applies for this session */
    }
    [themeToggle, themeToggleMobile].forEach((btn) => {
      if (!btn) return;
      const isLight = theme === "light";
      btn.setAttribute("aria-pressed", String(isLight));
      btn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    });
  }

  function toggleTheme() {
    applyTheme(currentTheme() === "light" ? "dark" : "light");
  }

  // Sync initial ARIA state (theme itself was already set in <head> to avoid flashing).
  applyTheme(currentTheme());

  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener("click", toggleTheme);

  /* ---------------- Health check ---------------- */
  function setStatus(elDot, elText, online) {
    if (!elDot || !elText) return;
    elDot.classList.remove("is-online", "is-offline");
    elDot.classList.add(online ? "is-online" : "is-offline");
    elText.textContent = online ? "System operational" : "System unavailable";
  }

  function checkHealth() {
    const dots = [
      [document.getElementById("status-dot"), document.getElementById("status-text")],
      [document.getElementById("status-dot-mobile"), document.getElementById("status-text-mobile")],
      [document.getElementById("status-dot-inline"), document.getElementById("status-text-inline")],
    ];

    fetch("/api/health", { method: "GET", headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
      })
      .then((data) => {
        const online = Boolean(data && data.status === "healthy");
        dots.forEach(([dot, text]) => setStatus(dot, text, online));
      })
      .catch(() => {
        dots.forEach(([dot, text]) => setStatus(dot, text, false));
      });
  }

  checkHealth();
  // Re-check periodically without hammering the server.
  setInterval(checkHealth, 45000);
})();
