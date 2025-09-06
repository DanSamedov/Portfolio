import fs from "node:fs";
import path from "node:path";
import * as SI from "simple-icons/icons"; // <— correct import

const slugs = [
  "python",
  "java",
  "javascript",
  "django",
  "fastapi",
  "websocket",
  "celery",
  "html5",
  "css3",
  "tailwindcss",
  "pandas",
  "numpy",
  "matplotlib",
  "scikitlearn",
  "postgresql",
  "mysql",
  "sqlalchemy",
  "redis",
  "pytest",
  "selenium",
  "telegram",
  "docker",
  "linux",
  "git",
];

fs.mkdirSync("icons", { recursive: true });

const toSiKey = (s) =>
  "si" +
  s
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");

for (const slug of slugs) {
  const key = toSiKey(slug); // e.g., "python" -> "siPython"
  const icon = SI[key];
  if (!icon) {
    console.warn("Missing in Simple Icons:", slug);
    continue;
  }
  const white = icon.svg.replace(/currentColor/g, "#FFFFFF");
  fs.writeFileSync(path.join("icons", `${slug}.svg`), white);
}
console.log("Done. Check ./icons");
