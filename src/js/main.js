"use strict";

import { $ } from "./utils/dom.js";
import { prefersReduced } from "./utils/constants.js";
import { initAnimations } from "./modules/animations.js";
import { initContactForm } from "./modules/contact-form.js";
import { initCopyToClipboard } from "./modules/copy-to-clipboard.js";
import { initNavSectionTracker } from "./modules/nav-tracker.js";
import { initProjectFilters } from "./modules/project-filters.js";
import { initProjectsLoadMore } from "./modules/project-loader.js";
import { initProjectModals } from "./modules/project-modal.js";
import { initRoleRotator } from "./modules/role-rotator.js";
import { setupScrollCue } from "./modules/scroll-cue.js";
import { initScrollProgressBar } from "./modules/scroll-progress.js";

document.addEventListener("DOMContentLoaded", () => {
  // Smooth-scroll internal anchors
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id && id !== "#" ? $(id) : null;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
      block: "start",
    });
  });

  // Download CV button
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-download]");
    if (!btn) return;
    e.preventDefault();
    const url = btn.getAttribute("data-download");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "cv.pdf");
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Initialize all modules
  initAnimations();
  initContactForm();
  initCopyToClipboard();
  initNavSectionTracker();
  const pagerApi = initProjectsLoadMore(3);
  initProjectFilters(pagerApi);
  initProjectModals();
  initRoleRotator();
  setupScrollCue();
  initScrollProgressBar();
});
