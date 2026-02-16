import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const stagedDir = path.join(root, "release", "webapp");
const noJekyllPath = path.join(stagedDir, ".nojekyll");

const collectHtmlFiles = (dir, files = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectHtmlFiles(fullPath, files);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
};

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

const relativePrefixForFile = (filePath) => {
  const relativeDir = path.dirname(path.relative(stagedDir, filePath));
  if (relativeDir === ".") return "./";
  const depth = relativeDir.split(path.sep).length;
  return "../".repeat(depth);
};

const rewriteHtmlAssetPaths = (filePath) => {
  const prefix = relativePrefixForFile(filePath);
  const original = readFileSync(filePath, "utf8");

  let rewritten = original.replace(/(["'])\/SB-ToolBox\//g, `$1${prefix}`);
  rewritten = rewritten.replace(
    /(["'])\/(_next\/|assets\/|favicon\.ico|file\.svg|globe\.svg|next\.svg|vercel\.svg|window\.svg)/g,
    `$1${prefix}$2`
  );

  if (rewritten !== original) {
    writeFileSync(filePath, rewritten, "utf8");
    return true;
  }

  return false;
};

const rewriteRuntimeChunkBasePath = (filePath) => {
  const original = readFileSync(filePath, "utf8");
  const rewritten = original.replace(
    /"\/SB-ToolBox\/_next\/"/g,
    '("file:"===location.protocol?"./_next/":"/SB-ToolBox/_next/")'
  );

  if (rewritten !== original) {
    writeFileSync(filePath, rewritten, "utf8");
    return true;
  }

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

const htmlFiles = collectHtmlFiles(stagedDir);
const rewrittenCount = htmlFiles.reduce((count, filePath) => {
  return rewriteHtmlAssetPaths(filePath) ? count + 1 : count;
}, 0);

const chunkDir = path.join(stagedDir, "_next", "static", "chunks");
let runtimePatchedCount = 0;
if (existsSync(chunkDir)) {
  const runtimeChunks = collectFiles(chunkDir).filter((filePath) => {
    const name = path.basename(filePath);
    return name.startsWith("turbopack-") && name.endsWith(".js");
  });

  runtimePatchedCount = runtimeChunks.reduce((count, filePath) => {
    return rewriteRuntimeChunkBasePath(filePath) ? count + 1 : count;
  }, 0);
}

writeFileSync(noJekyllPath, "", "utf8");

console.log(`Web app staged at ${stagedDir}`);
console.log(`Pruned ${prunedCount} non-distribution file(s) (.bak / empty asset files).`);
console.log(`Rewrote asset paths in ${rewrittenCount}/${htmlFiles.length} HTML files for portable hosting.`);
console.log(`Patched ${runtimePatchedCount} runtime chunk(s) for file:// + GitHub Pages compatibility.`);
console.log(`Created ${noJekyllPath} for GitHub Pages (_next) compatibility.`);
