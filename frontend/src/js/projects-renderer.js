"use strict";

import { projects } from "./data/projects.js";

function createTechPill(tech) {
  const pill = document.createElement("div");
  pill.className =
    "w-12 h-12 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-[24px] shadow-md -ml-4 group-hover:ml-0 transition-all duration-500";

  if (tech.isText) {
    const span = document.createElement("span");
    span.className = "font-bold";
    if (tech.name === "@") span.className += " text-sky-600";
    if (tech.name === "API") span.className += " text-green-600";
    if (tech.name === "DX") span.className += " text-slate-800";
    if (tech.name === "Py") span.className += " text-rose-600";
    if (tech.name === "DB") span.className += " text-violet-600";
    if (tech.name === "ML") span.className += " text-emerald-600";
    span.textContent = tech.name;
    pill.appendChild(span);
  } else {
    const img = document.createElement("img");
    img.src = tech.icon;
    img.alt = tech.name;
    img.className = "w-7 h-7";
    img.loading = "lazy";
    img.width = 28;
    img.height = 28;
    pill.appendChild(img);
  }
  return pill;
}

function createProjectCard(project) {
  const template = document.getElementById("project-card-template");
  if (!template) return null;

  const card = template.content.cloneNode(true).firstElementChild;

  card.dataset.project = project.category;
  if (project.liveUrl) card.dataset.live = project.liveUrl;
  if (project.repoUrl) card.dataset.repo = project.repoUrl;
  card.style.background = project.background;

  card.querySelector("h3").textContent = project.title;
  card.querySelector("p").textContent = project.description;

  const techContainer = card.querySelector(".tech-pills");
  project.tech.forEach((tech, i) => {
    const pill = createTechPill(tech);
    pill.style.zIndex = 3 - i;
    techContainer.appendChild(pill);
  });

  const previewImg = card.querySelector(".card-preview");
  previewImg.src = project.image;
  previewImg.alt = `${project.title} preview`;

  return card;
}

export function renderProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  projects.forEach((project) => {
    const card = createProjectCard(project);
    if (card) {
      grid.appendChild(card);
    }
  });
}
