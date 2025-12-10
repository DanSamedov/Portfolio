"use strict";

import { $, $$ } from "../utils/dom.js";

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

export function initContactForm() {
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
}
