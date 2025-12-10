"use strict";

import { $$ } from "../utils/dom.js";
import { esc, escAttr } from "../utils/helpers.js";
import { tiltOnHover } from "./tilt.js";

function _extractData(card) {
  const title = card.querySelector("h3")?.textContent.trim() || "Project";
  const desc =
    card.querySelector("p")?.textContent.trim() || "Project description";

  let imgSrc = "";
  let imgEl =
    card.querySelector(".card-preview") ||
    card.lastElementChild?.querySelector?.("img");
  if (!imgEl) {
    const imgs = card.querySelectorAll("img");
    if (imgs.length) imgEl = imgs[imgs.length - 1];
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

  return { title, desc, imgSrc, bg, liveUrl, repoUrl };
}

function _buildHTML({ title, desc, imgSrc, liveUrl, repoUrl, pillsHtml }) {
  const titleId = "modal-title-" + Math.random().toString(36).slice(2, 9);
  return {
    titleId,
    html: `
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
  `,
  };
}

function openProjectModal(card) {
  const data = _extractData(card);

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

  const { titleId, html } = _buildHTML({ ...data, pillsHtml });

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
  modal.style.background = data.bg;
  modal.style.willChange = "transform";
  modal.style.transform =
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  modal.innerHTML = html;

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
      try {
        card.classList.remove("hover-lock");
      } catch {}
      overlay.remove();
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", trap);
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

export function initProjectModals() {
  const cards = $$(".project-card");
  if (!cards.length) return;

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
