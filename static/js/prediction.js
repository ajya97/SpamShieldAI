/**
 * prediction.js
 * Handles: analyzer form (index.html) and result rendering (predict.html).
 * No unsafe innerHTML is used anywhere with user-supplied content.
 */
(function () {
  "use strict";

  const MAX_LEN = 20000;
  const MIN_LEN = 5;

  /* ============================================================
     ANALYZER FORM (index.html)
     ============================================================ */
  const form = document.getElementById("analyzer-form");

  if (form) {
    const textarea = document.getElementById("email_text");
    const counter = document.getElementById("char-counter");
    const hint = document.getElementById("field-hint");
    const clearBtn = document.getElementById("clear-btn");
    const exampleBtn = document.getElementById("example-btn");
    const analyzeBtn = document.getElementById("analyze-btn");

    const EXAMPLE_EMAIL =
      "Subject: You've been selected!\n\n" +
      "Congratulations! Your email has been selected to receive a FREE $1000 gift card. " +
      "Click the link below within 24 hours to claim your prize before it expires:\n\n" +
      "http://claim-your-prize-now.example.com\n\n" +
      "Act fast, this offer will not be repeated!";

    function updateCounter() {
      const len = textarea.value.length;
      counter.textContent = `${len} / ${MAX_LEN}`;
      counter.classList.toggle("is-near-limit", len > MAX_LEN * 0.95);
    }

    function setInvalid(isInvalid, message) {
      textarea.classList.toggle("is-invalid", isInvalid);
      textarea.setAttribute("aria-invalid", String(isInvalid));
      if (message) hint.textContent = message;
    }

    if (textarea) {
      updateCounter();
      textarea.addEventListener("input", () => {
        updateCounter();
        if (textarea.value.trim().length >= MIN_LEN) {
          setInvalid(false, "Minimum 5 characters required");
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        textarea.value = "";
        updateCounter();
        setInvalid(false, "Minimum 5 characters required");
        textarea.focus();
      });
    }

    if (exampleBtn) {
      exampleBtn.addEventListener("click", () => {
        textarea.value = EXAMPLE_EMAIL;
        updateCounter();
        setInvalid(false, "Minimum 5 characters required");
        textarea.focus();
      });
    }

    let isSubmitting = false;

    form.addEventListener("submit", (e) => {
      const value = textarea.value.trim();

      if (!value) {
        e.preventDefault();
        setInvalid(true, "Please enter some email text before analyzing.");
        textarea.focus();
        return;
      }

      if (value.length < MIN_LEN) {
        e.preventDefault();
        setInvalid(true, `Please enter at least ${MIN_LEN} characters.`);
        textarea.focus();
        return;
      }

      if (value.length > MAX_LEN) {
        e.preventDefault();
        setInvalid(true, `Email text is too long (max ${MAX_LEN} characters).`);
        return;
      }

      if (isSubmitting) {
        // Prevent duplicate submissions (e.g. double click / double Enter).
        e.preventDefault();
        return;
      }

      isSubmitting = true;
      analyzeBtn.classList.add("is-loading");
      analyzeBtn.disabled = true;
      showProcessingOverlay();
      // Form submits natively to POST /predict — no changes to the backend contract.
    });
  }

  /* ---------------- Processing overlay ---------------- */
  function showProcessingOverlay() {
    if (document.getElementById("processing-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "processing-overlay is-active";
    overlay.id = "processing-overlay";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");

    const panel = document.createElement("div");
    panel.className = "processing-panel";

    const rings = document.createElement("div");
    rings.className = "processing-rings";
    for (let i = 0; i < 3; i++) rings.appendChild(document.createElement("span"));

    const text = document.createElement("p");
    text.className = "processing-text";
    text.textContent = "Analyzing email content…";

    panel.appendChild(rings);
    panel.appendChild(text);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  /* ============================================================
     RESULT PAGE (predict.html)
     ============================================================ */
  const resultCard = document.querySelector(".result-card");

  if (resultCard && window.__RESULT__) {
    const rawConfidence = Number(window.__RESULT__.confidence);
    const safeConfidence = Number.isFinite(rawConfidence)
      ? Math.min(Math.max(rawConfidence, 0), 1)
      : 0;
    const percent = Math.round(safeConfidence * 10000) / 100; // e.g. 64.78

    const ring = document.getElementById("ring-progress");
    const numberEl = document.getElementById("confidence-number");
    const sentenceEl = document.getElementById("confidence-sentence");

    // Circle circumference for r=60: 2 * PI * 60 ≈ 376.99
    const CIRCUMFERENCE = 2 * Math.PI * 60;

    function describeConfidence(pct) {
      if (pct >= 90) return "highly confident";
      if (pct >= 70) return "fairly confident";
      if (pct >= 50) return "moderately confident";
      return "not very confident";
    }

    if (sentenceEl) sentenceEl.textContent = describeConfidence(percent);

    // Animate on next frame so the CSS transition actually runs.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (ring) {
          const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
          ring.style.strokeDashoffset = String(offset);
        }
        if (numberEl) animateNumber(numberEl, percent);
      });
    });

    function animateNumber(el, target) {
      const duration = 900;
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = (target * eased).toFixed(1);
        el.textContent = `${value}%`;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = `${target.toFixed(2)}%`;
      }
      requestAnimationFrame(tick);
    }
  }

  /* ---------------- Email preview: char count ---------------- */
  const previewBody = document.getElementById("email-preview-body");
  const charCountPill = document.getElementById("email-char-count");
  if (previewBody && charCountPill) {
    const len = previewBody.textContent.length;
    charCountPill.textContent = `${len.toLocaleString()} characters`;
  }

  /* ---------------- Copy actions ---------------- */
  function copyToClipboard(text, button, successLabel) {
    const originalLabel = button.textContent;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        button.textContent = successLabel || "Copied!";
        setTimeout(() => (button.textContent = originalLabel), 1800);
      })
      .catch(() => {
        button.textContent = "Copy failed";
        setTimeout(() => (button.textContent = originalLabel), 1800);
      });
  }

  const copyEmailBtn = document.getElementById("copy-email-btn");
  if (copyEmailBtn && previewBody) {
    copyEmailBtn.addEventListener("click", () => {
      copyToClipboard(previewBody.textContent, copyEmailBtn, "Copied!");
    });
  }

  const copyResultBtn = document.getElementById("copy-result-btn");
  if (copyResultBtn && window.__RESULT__) {
    copyResultBtn.addEventListener("click", () => {
      const pct = (Number(window.__RESULT__.confidence) * 100).toFixed(2);
      const summary = `Prediction: ${window.__RESULT__.prediction} (${pct}% confidence)`;
      copyToClipboard(summary, copyResultBtn, "Copied!");
    });
  }
})();
