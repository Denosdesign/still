#!/usr/bin/env node
/**
 * Flatten the Vite/TanStack static output into dist-pages for GitHub Pages.
 * Copies the SPA shell to index.html, 404.html, and each known route folder
 * so deep links return HTTP 200 instead of flashing a 404.
 */
import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CANDIDATES = ["dist", ".output/public", "dist/client"];
const ROUTES = ["pause", "start", "settings", "insights", "waitlist", "wins", "review", "didnt-buy"];

function findOutput() {
  for (const dir of CANDIDATES) {
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir);
    if (files.some((f) => f.endsWith(".html") || f === "assets")) return dir;
  }
  return null;
}

const src = findOutput();
if (!src) {
  console.error("[prepare-pages] no static output in", CANDIDATES.join(", "));
  process.exit(1);
}

const dest = "dist-pages";
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });

const shellNames = ["index.html", "_shell.html", "shell.html"];
const shell = shellNames.map((name) => join(dest, name)).find((p) => existsSync(p));
if (!shell) {
  console.error("[prepare-pages] no HTML shell in", dest, readdirSync(dest));
  process.exit(1);
}

copyFileSync(shell, join(dest, "index.html"));
copyFileSync(shell, join(dest, "404.html"));
for (const route of ROUTES) {
  const dir = join(dest, route);
  mkdirSync(dir, { recursive: true });
  copyFileSync(shell, join(dir, "index.html"));
}
writeFileSync(join(dest, ".nojekyll"), "");
console.log(`[prepare-pages] ${src} → ${dest} (shell ${shell}, routes ${ROUTES.join(", ")})`);
