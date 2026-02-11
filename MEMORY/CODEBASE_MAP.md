# CODEBASE_MAP.md

## Root Directory
- `application/`: Main application source code.
- `MEMORY/`: Project metadata and context.
- `ARTIFACTS/`: Design documents and workflow outputs.
- `PLANS/`: Implementation plans.

## Application Structure
- `application/electron/`:
  - `main.ts`: Application entry point and IPC registry.
  - `preload.ts`: Context bridge for renderer.
  - `SettingsStore.ts`: Persistent settings logic. [NEW]
  - `UpdateManager.ts`: Update lifecycle manager. [NEW]
- `application/src/`: Next.js renderer source.
  - `application/src/components/`: Reusable React components.
  - `application/src/app/`: Next.js App Router (assumed).
- `application/public/`: Static assets.
- `application/dist/`: Build output (Electron).
- `application/out/`: Static export output (Next.js).
