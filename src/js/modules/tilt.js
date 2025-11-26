"use strict";

export function tiltOnHover(
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
