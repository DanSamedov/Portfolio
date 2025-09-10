"use strict";

// helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const norm = (s) => (s || "").toLowerCase().trim();
const prefersReduced = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isVisible = (el) => {
  if (!el) return false;
  const cs = getComputedStyle(el);
  if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0")
    return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};

/* -------------------------
   3D tilt on hover (cards/modal)
------------------------- */
function tiltOnHover(
  el,
  { max = 10, scale = 1.02, speed = 150, perspective = 900 } = {}
) {
  if (!el) return;
  el.style.transformStyle = "preserve-3d";
  el.style.willChange = "transform";
  let raf = null;

  const apply = (x, y) => {
    const rect = el.getBoundingClientRect();
    const px = (x - rect.left) / rect.width;
    const py = (y - rect.top) / rect.height;
    const rx = (0.5 - py) * (max * 2);
    const ry = (px - 0.5) * (max * 2);
    el.style.transition = `transform ${speed}ms cubic-bezier(.22,.61,.36,1)`;
    el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
  };

  const reset = () => {
    el.style.transition = `transform ${speed}ms cubic-bezier(.22,.61,.36,1)`;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  el.addEventListener("mousemove", (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => apply(e.clientX, e.clientY));
  });
  el.addEventListener("mouseleave", () => {
    if (raf) cancelAnimationFrame(raf);
    reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Pagination API (initialized later so filters can reset it)
  let pagerApi = null;
  // Smooth-scroll internal anchors (delegated)
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

  const contactForm =
    $("#contact form") ||
    $("[data-contact-form]") ||
    $('input[placeholder="Your Name"]')?.closest("form") ||
    $('input[placeholder="Your Name"]')?.closest("div")?.parentElement;

  if (contactForm) {
    const inputs = $$("input, textarea", contactForm);
    inputs.forEach((el) => {
      el.addEventListener("focus", () =>
        el.classList.remove("error", "success")
      );
      el.addEventListener("blur", () => validateInput(el));
    });
  }

  const parallax = $(".hero-content");
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

  const animated = $$(".project-card, .skill-tag, .section-header");
  if (animated.length) {
    if (prefersReduced()) {
      animated.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    } else {
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
    }
  }

  const dd = $("#project-filter");
  if (dd) {
    const label = $("[data-label]", dd);
    const options = $$("[data-filter]", dd);
    const grid =
      $("#projects-grid") || dd.parentElement?.nextElementSibling || document;

    const applyFilter = (val) => {
      const v = norm(val);
      const cards = $$(".project-card", grid); // query fresh list to include newly added cards
      const matching = [];
      const rest = [];
      for (const c of cards) {
        const cats = norm(c.dataset.project).split(/\s+/);
        if (v === "all" || cats.includes(v)) {
          c.classList.remove("hidden");
          matching.push(c);
        } else {
          c.classList.add("hidden");
          rest.push(c);
        }
      }
      const parent = matching[0]?.parentElement || rest[0]?.parentElement;
      if (parent) {
        for (const c of matching.concat(rest)) parent.appendChild(c);
      }
      // Reset pagination after any filter change
      if (pagerApi && typeof pagerApi.reset === "function") pagerApi.reset();
    };

    options.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.dataset.filter;
        if (label) label.textContent = btn.textContent.trim();
        options.forEach((o) =>
          o.setAttribute("aria-selected", String(o === btn))
        );
        applyFilter(val);
        dd.open = false;
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
      });
    });

    const initial =
      options.find((o) => o.getAttribute("aria-selected") === "true")?.dataset
        .filter || "all";
    applyFilter(initial);
  }

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

  const cards = $$(".project-card");
  if (cards.length) {
    cards.forEach((card) => {
      if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "0");

      const open = (evt) => {
        if (evt?.target?.closest("a,button,[data-copy]")) return;
        openProjectModal(card);
      };

      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(e);
        }
      });
    });
  }

  initRoleRotator();
  setupScrollCue();
  initNavSectionTracker();

  // Initialize projects pagination (3 per batch)
  pagerApi = initProjectsLoadMore(3);
  window.__pagerApi = pagerApi;
});

/* validation */
function validateInput(input) {
  const v = (input.value || "").trim();
  const type = (
    input.getAttribute("data-validate") ||
    input.getAttribute("name") ||
    input.type ||
    input.placeholder ||
    ""
  ).toLowerCase();

  let ok = true;
  if (type.includes("name")) ok = v.length >= 2;
  else if (type.includes("email")) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  else if (type.includes("message") || input.tagName === "TEXTAREA")
    ok = v.length >= 10;

  input.classList.toggle("error", !ok);
  input.classList.toggle("success", ok);
  return ok;
}

/* scroll progress */
(() => {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;

  const update = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const pct = Math.min(100, (window.scrollY / max) * 100);
    bar.style.width = pct + "%";
  };

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

/* -------------------------
   Modal builder (tilt + centered close + links)
------------------------- */
function openProjectModal(card) {
  const title = card.querySelector("h3")?.textContent.trim() || "Project";
  const desc =
    card.querySelector("p")?.textContent.trim() || "Project description";
  // Prefer the explicit preview image (bottom image), not icon pills
  let imgSrc = "";
  let imgEl =
    card.querySelector(".card-preview") ||
    card.lastElementChild?.querySelector?.("img");
  if (!imgEl) {
    const imgs = card.querySelectorAll("img");
    if (imgs.length) imgEl = imgs[imgs.length - 1]; // fallback to the last image in the card
  }
  if (imgEl) imgSrc = imgEl.getAttribute("src") || "";
  if (!imgSrc) {
    imgSrc =
      card
        .querySelector(".project-image")
        ?.style.backgroundImage?.replace(/^url\(["']?|["']?\)$/g, "") || "";
  }

  const cs = getComputedStyle(card);
  const bg =
    (cs.backgroundImage &&
      cs.backgroundImage !== "none" &&
      cs.backgroundImage) ||
    (cs.background && cs.background.includes("gradient") && cs.background) ||
    "radial-gradient(circle at 50% 0%, rgb(81, 251, 251), rgb(13, 1, 60))";

  const liveUrl =
    card.dataset.live ||
    card.querySelector('a[data-live], a[rel="live"]')?.href ||
    card.querySelector('a[href^="http"]')?.href ||
    "";

  let repoUrl =
    card.dataset.repo ||
    card.querySelector('a[data-repo], a[rel="repo"]')?.href ||
    card.querySelector('a[href*="github.com"]')?.href ||
    "";
  if (repoUrl && !/github\.com/i.test(repoUrl)) repoUrl = "";

  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center px-5 sm:px-4 opacity-0 transition-opacity duration-300";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const modal = document.createElement("div");
  modal.className =
    "project-modal relative w-full max-w-4xl rounded-xl overflow-hidden group transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] translate-y-4";
  modal.style.boxShadow =
    "rgba(0,0,0,0.2) 0px 4px 12px, rgba(0,0,0,0.1) 0px 8px 24px";
  modal.style.background = bg;
  modal.style.willChange = "transform";
  modal.style.transform =
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";

  const titleId = "modal-title-" + Math.random().toString(36).slice(2, 9);

  // Prevent hover-enlarged card from staying enlarged while modal is open
  const unlock = () => {
    card.classList.remove("hover-lock");
    card.removeEventListener("mouseleave", unlock);
  };
  card.classList.add("hover-lock");
  card.addEventListener("mouseleave", unlock, { once: true });

  // Build non-animated icon pills for modal (mirror of card pills)
  const cardPillEls = Array.from(
    card.querySelectorAll(".w-12.h-12.rounded-full")
  ).slice(0, 3);
  const pillsHtml = cardPillEls
    .map((el, i) => {
      const inner = el.querySelector("img,svg,span");
      const content = inner ? inner.outerHTML : "";
      return `
        <div class="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-[20px] shadow-md"
             style="z-index:${3 - i}">
          ${content}
        </div>
      `;
    })
    .join("");

  modal.innerHTML = `
    <button
      class="modal-close absolute top-4 right-4 size-10 grid place-items-center rounded-full bg-black/30 text-white hover:bg-black/50 z-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label="Close"
    >
      <svg class="block size-5" xmlns="http://www.w3.org/2000/svg" fill="none"
           viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
    </button>

    <div class="relative z-10 flex flex-col gap-4 text-white p-4 sm:p-6">
      <h2 id="${titleId}" class="text-xl sm:text-2xl md:text-3xl font-bold">${esc(
    title
  )}</h2>
      <p class="text-sm sm:text-base text-white/80">${esc(desc)}</p>

      <div class="relative w-full flex justify-center rounded-2xl">
        ${
          imgSrc
            ? `<div class="overflow-hidden rounded-3xl w-[94%] sm:w-[92%] md:w-[90%] max-w-[960px] shadow-lg">
                  <img src="${escAttr(imgSrc)}" alt="${escAttr(title)} preview"
                       class="block w-full h-auto object-contain">
               </div>`
            : ""
        }
      </div>

      <div class="flex items-center justify-between mt-4 gap-4">
        <div class="flex items-center gap-3">
          ${
            liveUrl
              ? `
              <a href="${escAttr(
                liveUrl
              )}" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center gap-2 leading-none bg-black text-white font-semibold px-5 py-2.5 text-base rounded-3xl hover:opacity-80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <svg class="shrink-0 w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true" shape-rendering="geometricPrecision">
                  <path vector-effect="non-scaling-stroke" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 3h6v6"/>
                  <path vector-effect="non-scaling-stroke" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10 14L21 3"/>
                  <path vector-effect="non-scaling-stroke" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                </svg>
                Live Preview
              </a>`
              : ""
          }
          ${
            repoUrl
              ? `
              <a href="${escAttr(
                repoUrl
              )}" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center gap-2 leading-none bg-black text-white font-semibold px-5 py-2.5 text-base rounded-3xl hover:opacity-80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <svg class="shrink-0 w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true" shape-rendering="geometricPrecision">
                  <path vector-effect="non-scaling-stroke" stroke="currentColor" stroke-width="2"
                        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                GitHub
              </a>`
              : ""
          }
        </div>
        ${
          pillsHtml
            ? `<div class="flex items-center gap-2 ml-auto">${pillsHtml}</div>`
            : ""
        }
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  overlay.setAttribute("aria-labelledby", titleId);
  document.body.appendChild(overlay);

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    overlay.classList.remove("opacity-0");
    modal.classList.remove("translate-y-4");
  });

  const closeBtn = modal.querySelector(".modal-close");
  const close = () => {
    overlay.classList.add("opacity-0");
    modal.classList.add("translate-y-4");
    setTimeout(() => {
      // ensure hover lock is released on close
      try {
        card.classList.remove("hover-lock");
      } catch {}
      overlay.remove();
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", trap);
      // Avoid refocusing the card (which could retrigger focus styles)
      card.blur?.();
    }, 250);
  };
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);

  const trap = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      const f = modal.querySelectorAll(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener("keydown", trap);
  setTimeout(() => closeBtn.focus(), 10);

  tiltOnHover(modal, { max: 8, scale: 1.01, perspective: 1000, speed: 120 });
}

/* Tiny escapers (single copy only) */
function esc(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}
function escAttr(s = "") {
  return esc(s).replace(/"/g, "&quot;");
}

/* -------- Projects grid: Load More pagination -------- */
function initProjectsLoadMore(perPage = 3) {
  const grid = document.getElementById("projects-grid");
  if (!grid) return null;

  // Create or reuse Load More button placed after the grid
  let btn = document.getElementById("load-more-projects");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "load-more-projects";
    btn.type = "button";
    btn.className =
      "mt-6 mx-auto block h-10 rounded-full px-5 font-semibold border border-border bg-white/90 text-[#0d141c] shadow-sm transition-colors duration-300 ease-in-out hover:bg-primary hover:text-white";
    btn.textContent = "Load More";
    grid.insertAdjacentElement("afterend", btn);
  }

  const visibleCards = () =>
    Array.from(grid.querySelectorAll(".project-card")).filter(
      (c) => !c.classList.contains("hidden")
    );

  const apply = (limit) => {
    const items = visibleCards();
    let shown = 0;
    for (const c of items) {
      if (shown < limit) {
        c.classList.remove("pager-hidden");
      } else {
        c.classList.add("pager-hidden");
      }
      shown++;
    }
    // Always keep unmatched items hidden by pager as well
    for (const c of grid.querySelectorAll(".project-card.hidden")) {
      c.classList.add("pager-hidden");
    }
  };

  let shownCount = perPage;
  const updateButton = () => {
    const total = visibleCards().length;
    if (shownCount >= total) {
      btn.style.display = "none";
    } else {
      btn.style.display = "inline-block";
    }
  };

  const reset = () => {
    shownCount = perPage;
    apply(shownCount);
    updateButton();
  };

  const showMore = () => {
    const total = visibleCards().length;
    shownCount = Math.min(total, shownCount + perPage);
    apply(shownCount);
    updateButton();
  };

  btn.addEventListener("click", showMore);
  reset();

  return { reset, showMore };
}

/* -------- Typewriter role rotator -------- */
function initRoleRotator() {
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
function setupScrollCue() {
  const cues = $$(".animate-scroll-cue, #scroll-cue");
  if (!cues.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  cues.forEach((el) => {
    // a11y
    if (!el.hasAttribute("role")) el.setAttribute("role", "button");
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    el.setAttribute(
      "aria-label",
      el.getAttribute("aria-label") || "Scroll to next section"
    );

    const offset = getScrollOffsetFrom(el);

    const resolveTarget = () => {
      // explicit target via data-target="#id"
      if (el.dataset.target) {
        const t = document.querySelector(el.dataset.target);
        if (t) return t;
      }
      // next section-like element in the document
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
    $("[data-sticky-header]") ||
    $("header[role='banner']") ||
    $("header.site-header") ||
    $("header");

  if (header) {
    const cs = getComputedStyle(header);
    if (cs.position === "fixed" || cs.position === "sticky") {
      return header.offsetHeight || 0;
    }
  }
  return 0;
}

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

/* -------- Floating nav section tracker -------- */
function initNavSectionTracker() {
  const container = document.querySelector("header[role='banner'] .nav-glass");
  if (!container) return;

  const links = Array.from(container.querySelectorAll("a.nav-link"));
  if (!links.length) return;

  // Create tracker element
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

  // Map section id -> link
  const byId = new Map();
  links.forEach((a) => {
    const id = (a.getAttribute("href") || "").replace(/^#/, "");
    if (id) byId.set(id, a);
  });

  // Position tracker at the geometric center of the pill (link)
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

  // Toggle active state
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

  // Observe sections to update active link
  const sections = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  let currentId = null;
  // Track explicit user intent during smooth scroll
  let intentId = null;
  let intentDeadline = 0;
  const releaseIntent = () => {
    intentId = null;
    intentDeadline = 0;
  };

  const io = new IntersectionObserver(
    (entries) => {
      // Ignore IO while honoring a recent click intent
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
      // Bias to whichever section is near the vertical center
      threshold: [0.25, 0.5, 0.75],
      rootMargin: "-35% 0px -55% 0px",
    }
  );
  sections.forEach((s) => io.observe(s));

  // Also sync while scrolling (for smoother updates between IO thresholds)
  const getHeaderOffset = () => {
    const header = document.querySelector("header[role='banner']");
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
    // Prefer the section whose top is at/above the header and bottom below it
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top - offset <= 1 && r.bottom - offset > 1) return s.id;
    }
    // Fallback: choose the first section below the header, else the last
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
      // If we have an intended target from a click, hold until reached or deadline
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
            // Maintain tracker on intended link during scroll
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

  // Sync on click immediately for snappy UI
  links.forEach((a) => {
    a.addEventListener("click", () => {
      const id = (a.getAttribute("href") || "").replace(/^#/, "");
      const target = byId.get(id);
      if (target) {
        // Lock to intended section during smooth scroll
        intentId = id;
        intentDeadline = performance.now() + (prefersReduced() ? 200 : 1600);
        setActiveLink(target);
      }
    });
  });

  // Initial state: hash or first link
  const initialId = (
    location.hash ||
    links[0]?.getAttribute("href") ||
    ""
  ).replace(/^#/, "");
  const initialLink = byId.get(initialId) || links[0];
  setActiveLink(initialLink);

  // Keep aligned on resize
  window.addEventListener("resize", () => {
    const active = links.find((a) => a.getAttribute("aria-current") === "page");
    if (active) moveTo(active);
  });

  // Re-align after fonts/images load which can change layout
  window.addEventListener("load", () => {
    const active = links.find((a) => a.getAttribute("aria-current") === "page");
    if (active) moveTo(active);
  });

  // Re-align once web fonts have finished loading (if supported)
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      const active = links.find(
        (a) => a.getAttribute("aria-current") === "page"
      );
      if (active) moveTo(active);
    });
  }
}
