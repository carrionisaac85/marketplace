import { cpSync, mkdirSync } from "fs";

const routes = ["privacy", "support"];

for (const route of routes) {
  mkdirSync(`dist/${route}`, { recursive: true });
  cpSync("dist/index.html", `dist/${route}/index.html`);
  console.log(`✅ dist/${route}/index.html`);
}
