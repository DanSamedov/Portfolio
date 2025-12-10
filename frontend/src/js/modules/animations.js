"use strict";

import { $$, isVisible } from "../utils/dom.js";
import { prefersReduced } from "../utils/constants.js";

export function initAnimations() {
  const animated = $$(".project-card, .skill-tag, .section-header");
  if (!animated.length) return;

  if (prefersReduced()) {
    animated.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  for (const el of animated) {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    io.observe(el);
  }

  const parallax = document.querySelector(".hero-content");
  if (parallax && isVisible(parallax) && !prefersReduced()) {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          parallax.style.transform = `translateY(${window.scrollY * 0.5}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }
}
