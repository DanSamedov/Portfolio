"use strict";

export const norm = (s) => (s || "").toLowerCase().trim();

export function esc(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}
export function escAttr(s = "") {
  return esc(s).replace(/"/g, "&quot;");
}
