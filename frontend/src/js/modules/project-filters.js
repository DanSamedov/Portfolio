"use strict";

import { $, $$ } from "../utils/dom.js";
import { norm } from "../utils/helpers.js";

export function initProjectFilters(pagerApi) {
  const dd = $("#project-filter");
  if (!dd) return;

  const label = $("[data-label]", dd);
  const options = $$("[data-filter]", dd);
  const grid =
    $("#projects-grid") || dd.parentElement?.nextElementSibling || document;

  const applyFilter = (val) => {
    const v = norm(val);
    const cards = $$(".project-card", grid);
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
