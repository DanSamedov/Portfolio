"use strict";

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

export const isVisible = (el) => {
  if (!el) return false;
  const cs = getComputedStyle(el);
  if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0")
    return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};
