# VideoFlux - Project Instructions

## Project Overview

VideoFlux is a macOS Electron app for YouTube creators to mirror their Android phone screen and transfer video files via ADB/scrcpy.

## Tech Stack

- **Electron 28** with TypeScript (strict mode)
- **React 18** for renderer UI
- **Vite** for development server and bundling
- **Tailwind CSS** for styling
- **electron-builder** for packaging
- External tools: `adb`, `scrcpy` (via Homebrew)

## Development Commands

```bash
npm run dev        # Start Electron + Vite dev server
npm run build      # Build production app
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
```

## Architecture

```
src/
├── main/           # Electron main process (Node.js)
│   ├── index.ts    # Main entry, window creation, IPC handlers
│   ├── preload.ts  # Context bridge for renderer
│   ├── adb.ts      # ADB device detection and video listing
│   ├── scrcpy.ts   # Screen mirroring process management
│   ├── filesystem.ts # File transfer and filesystem detection
│   └── store.ts    # Persistent settings (destination path)
├── renderer/       # React UI (browser context)
│   ├── App.tsx     # Main app component
│   ├── mockApi.ts  # Browser mock API for dev without Electron
│   ├── components/
│   │   ├── DeviceStatus.tsx    # Connection status display
│   │   ├── MirrorControl.tsx   # Start/stop mirroring
│   │   ├── VideoList.tsx       # Video browser with thumbnails
│   │   ├── DestinationPicker.tsx
│   │   ├── TransferProgress.tsx
│   │   └── LargeFileWarning.tsx
│   └── styles/main.css
└── shared/
    └── types.ts    # Shared TypeScript types
```

## Key Patterns

### IPC Communication
All renderer-to-main communication goes through `contextBridge.exposeInMainWorld()` in preload.ts. The API is exposed as `window.api`. Never use `remote` module.

### Browser Development Mode
`mockApi.ts` provides a mock implementation of the Electron API for development in a regular browser (without Electron). Useful for UI development.

### Process Management
scrcpy is spawned as a detached process. PID is tracked for cleanup on stop or app quit.

### ADB Commands
Use `child_process.exec()` for ADB commands. Parse stdout for results. Video thumbnails are fetched via `adb shell content query` using Android MediaStore.

### File Transfers
Files are transferred using `adb pull`. The app detects filesystem type (FAT32, exFAT, etc.) and warns about 4GB file size limits on FAT32.

## External Dependencies

These must be installed on the system (not bundled):
- `adb` - `brew install android-platform-tools`
- `scrcpy` - `brew install scrcpy`

## PRDs

- `docs/PRD-001-VideoFlux.md` - Core features (device connection, mirroring, transfers)
- `docs/PRD-002-VideoFlux-UI-Redesign.md` - UI redesign with thumbnails
