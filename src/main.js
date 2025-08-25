const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const norm = (s) => (s || "").toLowerCase().trim();

document.addEventListener("DOMContentLoaded", () => {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      const target = id && id !== "#" ? $(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
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
});

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

  if (type.includes("name")) {
    ok = v.length >= 2;
  } else if (type.includes("email")) {
    ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  } else if (type.includes("message") || input.tagName === "TEXTAREA") {
    ok = v.length >= 10;
  }

  input.classList.toggle("error", !ok);
  input.classList.toggle("success", ok);
  return ok;
}
