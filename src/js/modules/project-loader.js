"use strict";

export function initProjectsLoadMore(perPage = 3) {
  const grid = document.getElementById("projects-grid");
  if (!grid) return null;

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
