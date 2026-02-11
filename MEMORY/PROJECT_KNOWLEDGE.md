# PROJECT_KNOWLEDGE: SB ToolBox

## Architecture Overview
- **Type**: Electron Application
- **Renderer**: Next.js (React)
- **Styling**: Tailwind CSS, Vanilla CSS
- **Animations**: GSAP
- **State Management**: React Hooks
- **Update System**: `electron-updater` with Zero-UX background logic and IPC signaling.
- **Distribution**: electron-builder
- **Targets**: win (portable, zip)

## Core Modules
- **Settings Management**: `SettingsStore.ts` (Class) manages user preferences via persistent JSON in `userData`.
- **Auto-Update Manager**: `UpdateManager.ts` (Class) wraps `electron-updater`, handles GitHub release checks, and pulses IPC events (available, progress, ready).

## Key Components
- `electron/main.ts`: Main process entry point.
- `electron/preload.ts`: Bridge between main and renderer.
- `src/components/pages/SupportPage.tsx`: Example page.

## Configuration
- `package.json`: Contains electron-builder config and dependencies.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.

## Dependencies
- Next.js 16.1.4
- React 19.2.3
- GSAP 3.14.2
- Electron 40.0.0
- electron-builder 26.7.0
