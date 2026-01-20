# VideoFlux - Project Instructions

## Project Overview

VideoFlux is a macOS Electron app for YouTube creators to mirror their Android phone screen and transfer video files.

## Tech Stack

- **Electron** with TypeScript (strict mode)
- **React** for renderer UI
- **electron-builder** for packaging
- External tools: `adb`, `scrcpy` (via Homebrew)

## Development Commands

```bash
npm run dev        # Start Electron in development mode
npm run build      # Build production app
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
```

## Architecture

- `src/main/` - Electron main process (Node.js)
- `src/renderer/` - React UI (browser context)
- `src/shared/` - Shared TypeScript types
- Communication via IPC with typed preload bridge

## Key Patterns

### IPC Communication
All renderer-to-main communication goes through `contextBridge.exposeInMainWorld()` in preload.ts. Never use `remote` module.

### Process Management
scrcpy is spawned as detached process. Track PID for cleanup.

### ADB Commands
Use `child_process.exec()` for ADB commands. Parse stdout for results.

## External Dependencies

These must be installed on the system (not bundled):
- `adb` - `brew install android-platform-tools`
- `scrcpy` - `brew install scrcpy`

## PRD Location

Active PRD: `docs/PRD-001-VideoFlux.md`
