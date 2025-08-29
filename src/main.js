// helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const norm = (s) => (s || "").toLowerCase().trim();

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
    const px = (x - rect.left) / rect.width; // 0..1
    const py = (y - rect.top) / rect.height; // 0..1
    const rx = (0.5 - py) * (max * 2); // -max..max
    const ry = (px - 0.5) * (max * 2); // -max..max
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
  /* smooth scrolling */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      const target = id && id !== "#" ? $(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* contact form hooks */
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

  /* parallax */
  const parallax = $(".hero-content");
  if (parallax) {
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

  /* reveal on view */
  const animated = $$(".project-card, .skill-tag, .section-header");
  if (animated.length) {
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

  /* dropdown filter */
  const dd = $("#project-filter");
  if (dd) {
    const label = $("[data-label]", dd);
    const options = $$("[data-filter]", dd);
    const grid =
      $("#projects-grid") || dd.parentElement?.nextElementSibling || document;
    let cards = $$(".project-card", grid);

    const applyFilter = (val) => {
      const v = norm(val);
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

  /* click-to-copy */
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

  /* project cards -> open modal (no tilt on grid) */
  const cards = $$(".project-card");
  if (cards.length) {
    cards.forEach((card) => {
      if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "0");

      const open = (evt) => {
        // ignore clicks on links/buttons inside the card
        if (evt?.target?.closest("a,button,[data-copy]")) return;
        openProjectModal(card); // modal still has tilt
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
  const imgSrc =
    card.querySelector("img")?.getAttribute("src") ||
    card
      .querySelector(".project-image")
      ?.style.backgroundImage?.replace(/^url\(["']?|["']?\)$/g, "") ||
    "";

  // reuse the card's gradient/background
  const cs = getComputedStyle(card);
  const bg =
    (cs.backgroundImage &&
      cs.backgroundImage !== "none" &&
      cs.backgroundImage) ||
    (cs.background && cs.background.includes("gradient") && cs.background) ||
    "radial-gradient(circle at 50% 0%, rgb(81, 251, 251), rgb(13, 1, 60))";

  // links
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

  // overlay
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center px-5 sm:px-4 opacity-0 transition-opacity duration-300";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  // modal
  const modal = document.createElement("div");
  modal.className =
    "relative w-full max-w-3xl rounded-xl overflow-hidden group transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] translate-y-4";
  modal.style.boxShadow =
    "rgba(0,0,0,0.2) 0px 4px 12px, rgba(0,0,0,0.1) 0px 8px 24px";
  modal.style.background = bg;
  modal.style.willChange = "transform";
  modal.style.transform =
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";

  const titleId = "modal-title-" + Math.random().toString(36).slice(2, 9);

  modal.innerHTML = `
    <!-- perfectly centered close -->
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

      <div class="relative w-full min-h-[200px] sm:min-h-[420px] flex justify-center rounded-2xl">
        ${
          imgSrc
            ? `<img src="${escAttr(imgSrc)}" alt="${escAttr(title)} preview"
                    class="rounded-2xl w-[90%] sm:w-[80%] md:w-[400px] object-contain">`
            : ""
        }
      </div>

      <div class="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
        <div class="flex flex-wrap justify-center sm:justify-start gap-3">
          ${
            liveUrl
              ? `
              <a href="${escAttr(
                liveUrl
              )}" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center gap-2 leading-none bg-black text-white font-semibold px-4 py-2 rounded-3xl hover:opacity-80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <svg
                  class="shrink-0 w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  shape-rendering="geometricPrecision">
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
                class="inline-flex items-center gap-2 leading-none bg-black text-white font-semibold px-4 py-2 rounded-3xl hover:opacity-80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <svg
                  class="shrink-0 w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  shape-rendering="geometricPrecision">
                  <path vector-effect="non-scaling-stroke" stroke="currentColor" stroke-width="2"
                        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                GitHub
              </a>`
              : ""
          }
        </div>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  overlay.setAttribute("aria-labelledby", titleId);
  document.body.appendChild(overlay);

  // lock scroll
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  // animate in (remove the 'opacity-0' class so Tailwind doesn't fight itself)
  requestAnimationFrame(() => {
    overlay.classList.remove("opacity-0");
    modal.classList.remove("translate-y-4");
  });

  // close handlers
  const closeBtn = modal.querySelector(".modal-close");
  const close = () => {
    overlay.classList.add("opacity-0");
    modal.classList.add("translate-y-4");
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", trap);
      card.focus?.();
    }, 250);
  };
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close(); // click outside
  });
  closeBtn.addEventListener("click", close);

  // ESC + focus trap
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

  // modal tilt
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
