"use strict";

export function initRoleRotator() {
  const el = document.getElementById("role-rotator");
  if (!el) return;

  let phrases;
  try {
    phrases = JSON.parse(el.getAttribute("data-phrases") || "[]");
  } catch {
    phrases = [];
  }
  if (!phrases.length) {
    phrases = ["Backend Developer", "CS & Econometrics Student"];
  }

  el.textContent = "";

  const wrap = document.createElement("span");
  wrap.className = "typewriter";

  const text = document.createElement("span");
  text.className = "typewriter__text";

  const cursor = document.createElement("span");
  cursor.className = "typewriter__cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.textContent = "|";

  wrap.appendChild(text);
  wrap.appendChild(cursor);
  el.appendChild(wrap);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const TYPE = 80;
  const ERASE = 40;
  const HOLD = 1400;
  const GAP = 200;

  if (reduced) {
    let i = 0;
    text.textContent = phrases[0];
    setInterval(() => {
      i = (i + 1) % phrases.length;
      text.textContent = phrases[i];
    }, HOLD + 800);
    return;
  }

  let pi = 0;
  let ci = 0;

  function type() {
    const word = phrases[pi];
    if (ci <= word.length) {
      text.textContent = word.slice(0, ci);
      ci += 1;
      setTimeout(type, TYPE);
    } else {
      setTimeout(() => {
        setTimeout(erase, GAP);
      }, HOLD);
    }
  }

  function erase() {
    const word = phrases[pi];
    if (ci > 0) {
      ci -= 1;
      text.textContent = word.slice(0, ci);
      setTimeout(erase, ERASE);
    } else {
      pi = (pi + 1) % phrases.length;
      setTimeout(type, GAP);
    }
  }

  type();
}
