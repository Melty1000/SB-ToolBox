import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const stagedDir = path.join(root, "release", "webapp");
const noJekyllPath = path.join(stagedDir, ".nojekyll");

const collectFiles = (dir, files = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
};

const shouldPruneFile = (filePath) => {
  const name = path.basename(filePath).toLowerCase();
  if (name.endsWith(".bak")) return true;

  const isAssetFile = filePath.includes(`${path.sep}assets${path.sep}`);
  if (isAssetFile && statSync(filePath).size === 0) return true;

  return false;
};

if (!existsSync(outDir)) {
  console.error("Missing `out` directory. Run renderer build first.");
  process.exit(1);
}

rmSync(stagedDir, { recursive: true, force: true });
mkdirSync(path.dirname(stagedDir), { recursive: true });
cpSync(outDir, stagedDir, { recursive: true });

const allFiles = collectFiles(stagedDir);
let prunedCount = 0;
for (const filePath of allFiles) {
  if (!shouldPruneFile(filePath)) continue;
  rmSync(filePath, { force: true });
  prunedCount += 1;
}

writeFileSync(noJekyllPath, "", "utf8");

console.log(`Web app staged at ${stagedDir}`);
console.log(`Pruned ${prunedCount} non-distribution file(s) (.bak / empty asset files).`);
console.log("Preserved Next.js basePath asset/runtime URLs for GitHub Pages hydration.");
console.log(`Created ${noJekyllPath} for GitHub Pages (_next) compatibility.`);
