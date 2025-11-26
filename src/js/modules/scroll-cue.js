"use strict";

import { $$ } from "../utils/dom.js";
import { prefersReduced } from "../utils/constants.js";

function getScrollTargets() {
  const all = $$("section, [data-section], [id]");
  return all.filter((el) => {
    const tag = el.tagName.toLowerCase();
    if (/^(script|style|link|meta|title|head)$/.test(tag)) return false;
    if (!el.id && !el.matches("section,[data-section]")) return false;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return (
      r.width > 0 &&
      r.height > 0 &&
      cs.display !== "none" &&
      cs.visibility !== "hidden"
    );
  });
}

function getScrollOffsetFrom(el) {
  const attr = el.getAttribute("data-scroll-offset");
  if (attr && !isNaN(parseFloat(attr))) return parseFloat(attr);

  const header =
    document.querySelector("[data-sticky-header]") ||
    document.querySelector("header[role='banner']") ||
    document.querySelector("header.site-header") ||
    document.querySelector("header");

  if (header) {
    const cs = getComputedStyle(header);
    if (cs.position === "fixed" || cs.position === "sticky") {
      return header.offsetHeight || 0;
    }
  }
  return 0;
}

export function setupScrollCue() {
  const cues = $$(".animate-scroll-cue, #scroll-cue");
  if (!cues.length) return;

  const reduced = prefersReduced();

  cues.forEach((el) => {
    if (!el.hasAttribute("role")) el.setAttribute("role", "button");
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    el.setAttribute(
      "aria-label",
      el.getAttribute("aria-label") || "Scroll to next section"
    );

    const offset = getScrollOffsetFrom(el);

    const resolveTarget = () => {
      if (el.dataset.target) {
        const t = document.querySelector(el.dataset.target);
        if (t) return t;
      }
      const sections = getScrollTargets();
      const y = window.scrollY;
      return (
        sections.find(
          (s) => s.getBoundingClientRect().top + window.scrollY > y + 1
        ) ||
        sections[sections.length - 1] ||
        null
      );
    };

    const go = () => {
      const t = resolveTarget();
      if (!t) return;
      const top = t.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top,
        left: 0,
        behavior: reduced ? "auto" : "smooth",
      });
    };

    el.addEventListener("click", (e) => {
      e.preventDefault();
      go();
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });
}
