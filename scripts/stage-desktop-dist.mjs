import { createHash } from "node:crypto";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const mode = (process.argv[2] || "all").toLowerCase();
const validModes = new Set(["installer", "portable", "all"]);

if (!validModes.has(mode)) {
  console.error(`Invalid mode "${mode}". Expected: installer | portable | all.`);
  process.exit(1);
}

const root = process.cwd();
const releaseDir = path.join(root, "release");
const desktopDir = path.join(releaseDir, "desktop");
const installerDir = path.join(desktopDir, "installer");
const portableDir = path.join(desktopDir, "portable");

const shouldStageInstaller = mode === "installer" || mode === "all";
const shouldStagePortable = mode === "portable" || mode === "all";
const selectedArtifactDirs = [
  ...(shouldStageInstaller ? [installerDir] : []),
  ...(shouldStagePortable ? [portableDir] : []),
];

const ensureDir = (dirPath) => {
  mkdirSync(dirPath, { recursive: true });
};

const ensureCleanDir = (dirPath) => {
  rmSync(dirPath, { recursive: true, force: true });
  mkdirSync(dirPath, { recursive: true });
};

const safeMove = (srcPath, destPath) => {
  if (existsSync(destPath)) {
    rmSync(destPath, { force: true, recursive: true });
  }
  ensureDir(path.dirname(destPath));
  renameSync(srcPath, destPath);
};

const moveMatchingFiles = (patterns, destinationDir) => {
  if (!existsSync(releaseDir)) return [];

  const moved = [];
  for (const entry of readdirSync(releaseDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!patterns.some((pattern) => pattern.test(entry.name))) continue;

    const srcPath = path.join(releaseDir, entry.name);
    const destPath = path.join(destinationDir, entry.name);
    safeMove(srcPath, destPath);
    moved.push(destPath);
  }

  return moved;
};

const cleanupIntermediateOutput = () => {
  const transientPaths = [
    path.join(releaseDir, "win-unpacked"),
    path.join(releaseDir, "builder-debug.yml"),
    path.join(releaseDir, ".icon-ico"),
  ];

  for (const targetPath of transientPaths) {
    if (existsSync(targetPath)) {
      rmSync(targetPath, { recursive: true, force: true });
    }
  }
};

const purgeRootArtifacts = () => {
  if (!existsSync(releaseDir)) return;

  const knownArtifactPattern = [
    /^SB-ToolBox-Setup-.*\.exe$/i,
    /^SB-ToolBox-Setup-.*\.exe\.blockmap$/i,
    /^SB-ToolBox-Portable-.*\.exe$/i,
    /^latest\.yml$/i,
  ];

  for (const entry of readdirSync(releaseDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!knownArtifactPattern.some((pattern) => pattern.test(entry.name))) continue;
    rmSync(path.join(releaseDir, entry.name), { force: true });
  }
};

const collectArtifacts = (targetDirs) => {
  const entries = [];
  const accepted = [
    /^SB-ToolBox-Setup-.*\.exe$/i,
    /^SB-ToolBox-Setup-.*\.exe\.blockmap$/i,
    /^SB-ToolBox-Portable-.*\.exe$/i,
    /^latest\.yml$/i,
  ];

  for (const targetDir of targetDirs) {
    if (!existsSync(targetDir)) continue;
    for (const entry of readdirSync(targetDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!accepted.some((pattern) => pattern.test(entry.name))) continue;
      entries.push(path.join(targetDir, entry.name));
    }
  }

  return entries.sort((a, b) => a.localeCompare(b));
};

const sha256 = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });

const movedArtifacts = [];

if (shouldStageInstaller) {
  ensureCleanDir(installerDir);
  movedArtifacts.push(
    ...moveMatchingFiles(
      [/^SB-ToolBox-Setup-.*\.exe$/i, /^SB-ToolBox-Setup-.*\.exe\.blockmap$/i, /^latest\.yml$/i],
      installerDir
    )
  );
}

if (shouldStagePortable) {
  ensureCleanDir(portableDir);
  movedArtifacts.push(...moveMatchingFiles([/^SB-ToolBox-Portable-.*\.exe$/i], portableDir));
}

// Keep root release clean for uploads and avoid shipping builder internals.
cleanupIntermediateOutput();
purgeRootArtifacts();

if (movedArtifacts.length === 0) {
  console.error("No desktop artifacts were staged. Check electron-builder output.");
  process.exit(1);
}

const artifacts = collectArtifacts(selectedArtifactDirs);
const checksumLines = [];
for (const artifactPath of artifacts) {
  const digest = await sha256(artifactPath);
  const rel = path.relative(desktopDir, artifactPath).replace(/\\/g, "/");
  checksumLines.push(`${digest}  ${rel}`);
}

writeFileSync(path.join(desktopDir, "checksums.sha256"), `${checksumLines.join("\n")}\n`, "utf8");

console.log(`Desktop artifacts staged (${mode}) -> ${desktopDir}`);
for (const artifactPath of movedArtifacts) {
  console.log(` - ${path.relative(releaseDir, artifactPath).replace(/\\/g, "/")}`);
}
console.log(`Checksums written -> ${path.join(desktopDir, "checksums.sha256")}`);
