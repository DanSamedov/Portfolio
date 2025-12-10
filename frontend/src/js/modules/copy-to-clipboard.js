"use strict";

export function initCopyToClipboard() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;

    e.preventDefault();
    const text = btn.dataset.copy || btn.textContent.trim();

    const flash = () => {
      const original = btn.textContent;
      btn.textContent = btn.dataset.copied || "Copied!";
      btn.classList.add("text-[#0d80f2]");
      const pill = btn.closest(".group") || btn.parentElement;
      pill && pill.classList.add("ring-2", "ring-[#0d80f2]/30");

      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("text-[#0d80f2]");
        pill && pill.classList.remove("ring-2", "ring-[#0d80f2]/30");
      }, 1200);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(flash)
        .catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
      flash();
    }
  });
}
