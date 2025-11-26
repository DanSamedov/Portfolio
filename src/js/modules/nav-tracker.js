"use strict";

import { $ } from "../utils/dom.js";
import { prefersReduced } from "../utils/constants.js";

export function initNavSectionTracker() {
  const container = document.querySelector("header[role='banner'] .nav-glass");
  if (!container) return;

  const links = Array.from(container.querySelectorAll("a.nav-link"));
  if (!links.length) return;

  let tracker = container.querySelector(".nav-tracker");
  if (!tracker) {
    tracker = document.createElement("span");
    tracker.className = "nav-tracker";
    container.appendChild(tracker);
  }

  const reduced = prefersReduced();
  if (reduced) {
    tracker.style.transition = "none";
  }

  const byId = new Map();
  links.forEach((a) => {
    const id = (a.getAttribute("href") || "").replace(/^#/, "");
    if (id) byId.set(id, a);
  });

  const moveTo = (link) => {
    if (!link || !tracker) return;
    const left = link.offsetLeft;
    const width = link.offsetWidth;
    const trackerWidth =
      tracker.getBoundingClientRect().width || tracker.offsetWidth || 26;
    const biasVar = getComputedStyle(container)
      .getPropertyValue("--tracker-bias")
      .trim();
    const bias = parseFloat(biasVar) || 0;
    const x = left + width / 2 - trackerWidth / 2 + bias;
    tracker.style.transform = `translateX(${x}px)`;
    tracker.style.opacity = "1";
  };

  const setActiveLink = (link) => {
    if (!link) return;
    links.forEach((a) => {
      const active = a === link;
      if (active) {
        a.setAttribute("aria-current", "page");
        a.classList.add("bg-muted", "text-primary", "shadow-lg");
      } else {
        a.removeAttribute("aria-current");
        a.classList.remove("bg-muted", "text-primary", "shadow-lg");
      }
    });
    moveTo(link);
  };

  const sections = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  let currentId = null;
  let intentId = null;
  let intentDeadline = 0;
  const releaseIntent = () => {
    intentId = null;
    intentDeadline = 0;
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (intentId && performance.now() < intentDeadline) return;
      let best = null;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (!best) return;
      const id = best.target.id;
      if (id && id !== currentId) {
        currentId = id;
        const link = byId.get(id);
        setActiveLink(link);
      }
    },
    {
      threshold: [0.25, 0.5, 0.75],
      rootMargin: "-35% 0px -55% 0px",
    }
  );
  sections.forEach((s) => io.observe(s));

  const getHeaderOffset = () => {
    const header = $("header[role='banner']");
    if (header) {
      const cs = getComputedStyle(header);
      if (cs.position === "fixed" || cs.position === "sticky") {
        return header.offsetHeight || 0;
      }
    }
    return 0;
  };

  const pickActiveSection = () => {
    const offset = getHeaderOffset();
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top - offset <= 1 && r.bottom - offset > 1) return s.id;
    }
    for (const s of sections) {
      if (s.getBoundingClientRect().top - offset > 1) return s.id;
    }
    return sections[sections.length - 1].id;
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const now = performance.now();
      if (intentId && now < intentDeadline) {
        const targetSection = document.getElementById(intentId);
        if (targetSection) {
          const offset = getHeaderOffset();
          const r = targetSection.getBoundingClientRect();
          const nearTop = Math.abs(r.top - offset) < 8;
          const coveringHeader = r.top - offset <= 1 && r.bottom - offset > 1;
          if (nearTop || coveringHeader) {
            currentId = intentId;
            const link = byId.get(intentId);
            setActiveLink(link);
            releaseIntent();
          } else {
            const link = byId.get(intentId);
            if (link) moveTo(link);
            ticking = false;
            return;
          }
        }
      }

      const id = pickActiveSection();
      if (id && id !== currentId) {
        currentId = id;
        const link = byId.get(id);
        setActiveLink(link);
      }
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  links.forEach((a) => {
    a.addEventListener("click", () => {
      const id = (a.getAttribute("href") || "").replace(/^#/, "");
      const target = byId.get(id);
      if (target) {
        intentId = id;
        intentDeadline = performance.now() + (prefersReduced() ? 200 : 1600);
        setActiveLink(target);
      }
    });
  });

  const initialId = (
    location.hash ||
    links[0]?.getAttribute("href") ||
    ""
  ).replace(/^#/, "");
  const initialLink = byId.get(initialId) || links[0];
  setActiveLink(initialLink);

  window.addEventListener("resize", () => {
    const active = links.find((a) => a.getAttribute("aria-current") === "page");
    if (active) moveTo(active);
  });

  window.addEventListener("load", () => {
    const active = links.find((a) => a.getAttribute("aria-current") === "page");
    if (active) moveTo(active);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      const active = links.find(
        (a) => a.getAttribute("aria-current") === "page"
      );
      if (active) moveTo(active);
    });
  }
}
