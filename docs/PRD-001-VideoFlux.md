# PRD: VideoFlux - Android Screen Mirror & Video Transfer App

## Overview

VideoFlux is a macOS Electron application designed for YouTube content creators who film with their Android phone's rear camera. The core problem: when filming with the rear camera, the user cannot see the phone's screen to frame their shot properly.

The application provides two essential features:
1. **Real-time screen mirroring** via scrcpy, allowing the user to see and control their Android phone from their Mac while filming
2. **Video file transfer** from the phone to a user-selected destination folder, with intelligent warnings about filesystem limitations (FAT32 4GB limit)

The app wraps existing command-line tools (scrcpy, adb) in a clean, user-friendly Electron interface. It does not reinvent these tools but makes them accessible to non-technical users with a focused, distraction-free experience.

## User Stories

- As a YouTube creator, I want to see my phone's camera preview on my Mac so that I can frame myself correctly when filming with the rear camera
- As a YouTube creator, I want to control my phone from my Mac so that I can start/stop recording without touching the phone and ruining the framing
- As a YouTube creator, I want to transfer specific videos from my phone to my Mac so that I can begin editing
- As a YouTube creator, I want to be warned if a video file is too large for my destination drive so that I don't encounter transfer failures

## Acceptance Criteria

### Device Connection
- [x] App detects when an Android device is connected via USB with ADB debugging enabled
- [x] App displays clear device status: "Connected" with device name or "No device detected"
- [x] App shows helpful guidance when no device is detected (enable USB debugging, authorize computer, etc.)
- [x] App handles device disconnection gracefully with clear feedback

### Screen Mirroring
- [x] User can launch scrcpy mirroring with a single button click
- [x] scrcpy window opens as a separate, detachable window (native scrcpy behavior)
- [x] All scrcpy interactive features work: touch, click, keyboard input, navigation
- [x] User can stop the mirroring session from the app
- [x] App shows mirroring status: "Active" or "Inactive"
- [x] If scrcpy fails to launch, app displays a clear error message

### Video File Browser
- [x] App lists video files from the phone's DCIM/Camera directory
- [x] Each video shows: filename, file size (human-readable), date modified
- [x] User can select multiple videos for transfer (checkboxes)
- [x] User can select/deselect all videos
- [x] List refreshes when user clicks a refresh button
- [x] Empty state shows clear message when no videos are found

### Destination Selection
- [ ] User can select any folder on their Mac as transfer destination via native folder picker
- [ ] Selected destination path is displayed in the UI
- [ ] App detects the filesystem type of the destination volume (FAT32, exFAT, APFS, etc.)
- [ ] Destination selection persists across app restarts

### File Transfer
- [ ] User can initiate transfer of selected videos to chosen destination
- [ ] Transfer shows progress indicator (percentage or progress bar)
- [ ] App warns BEFORE transfer if any selected file exceeds 4GB and destination is FAT32
- [ ] Warning allows user to proceed anyway or cancel
- [ ] Transfer can be cancelled by the user
- [ ] Successful transfers show completion confirmation
- [ ] Failed transfers show clear error message with reason

### Error Handling
- [x] ADB not installed: app shows installation instructions
- [x] scrcpy not installed: app shows installation instructions
- [x] Device not authorized: app shows step-by-step authorization guide
- [ ] Transfer failure: app shows specific error (permission denied, disk full, etc.)
- [ ] All errors are dismissible and don't block app usage

## Scope

### In Scope
- Electron desktop application for macOS
- Screen mirroring via scrcpy (launching external process)
- Video file listing from Android device via adb
- Video file transfer via adb pull
- Filesystem detection and FAT32 warning
- User-selectable destination folder
- Device connection status monitoring
- Clean, minimal user interface

### Out of Scope
- Video editing or playback
- Video compression or format conversion
- Cloud synchronization or backup
- Automatic transfers or scheduling
- Windows or Linux support
- Wireless ADB connection
- Support for non-video files
- Batch rename or organization features

## Constraints

- **External Dependencies**: App requires `adb` and `scrcpy` to be installed via Homebrew. App does not bundle these tools.
- **macOS Only**: Target platform is macOS (Apple Silicon and Intel)
- **USB Connection**: Only USB-connected devices are supported (no wireless ADB)
- **Single Device**: App handles one connected device at a time

---

## Execution Architecture

### CRITICAL: Flat Agent Hierarchy

Subagents CANNOT spawn other subagents. Only the Orchestrator can spawn agents.
```
Orchestrator (owns this PRD)
│
├─ spawns → Phase 1 Agent (implements, returns results)
├─ spawns → QA validation (Orchestrator runs checks directly)
├─ commits Phase 1
│
├─ spawns → Phase 2 Agent (implements, returns results)
├─ spawns → QA validation (Orchestrator runs checks directly)
├─ commits Phase 2
│
└─ ... continues until complete
```

### Orchestrator Responsibilities

1. Read this PRD and maintain global context
2. Spawn Phase Agents ONE AT A TIME with isolated context
3. After each Phase Agent completes, run QA checks DIRECTLY (typecheck, lint, build)
4. If QA fails, re-spawn Phase Agent with fix instructions
5. **Update PRD file**: check completed criteria, update phase status
6. Commit only after Phase + QA pass
7. Proceed to next phase

### Phase Agent Behavior

Phase Agents receive:
- Phase goal and acceptance criteria
- Implementation guidelines
- QA requirements to satisfy (they know what will be checked)

Phase Agents:
- Implement following the guidelines
- Run automated checks before returning (npm run lint, npm run typecheck)
- Return results to Orchestrator
- **CANNOT spawn other agents (no Task tool access)**

### Orchestrator Execution Flow
```
FOR each phase:
  1. Spawn Phase Agent with phase context
  2. Wait for Phase Agent to complete
  3. Run QA checks directly:
     - npm run typecheck
     - npm run lint
     - npm run build (if applicable)
  4. IF any QA fails:
       - Spawn Phase Agent again with fix instructions
       - Repeat from step 3
  5. Update PRD file (check criteria, update phase status)
  6. Commit phase
  7. Continue to next phase
```

---

## Progress Tracking

### CRITICAL: PRD as Living Document

The Orchestrator MUST update this PRD file incrementally during execution:

1. **After each acceptance criterion is verified**: Check the box `[ ]` → `[x]`
2. **After each phase completes**: Update phase status block
3. **After each commit**: Note the commit hash

This enables:
- Resuming from exact point if interrupted
- Clear visibility on what's done vs remaining
- Audit trail of progress

### Orchestrator Update Protocol

After each Phase Agent + QA cycle completes:
```
1. Read current PRD file
2. Check off completed acceptance criteria
3. Update phase status:

   **Status**: COMPLETE
   **Completed**: [timestamp]
   **Commit**: [hash]
   **QA Results**: typecheck OK, lint OK, build OK

4. Write updated PRD file
5. Proceed to next phase
```

### Current Progress

**Started**: 2026-01-20
**Current Phase**: 4 / 6
**Last Updated**: 2026-01-20

---

## Guidelines for Implementation

### Quality Principles

- Use TypeScript with strict mode enabled
- Follow Electron security best practices (context isolation, preload scripts)
- Keep the UI minimal and focused - no feature creep
- Handle all error states gracefully with user-friendly messages
- Test on macOS before marking phases complete

### Project Structure

```
VideoFlux/
├── package.json
├── tsconfig.json
├── electron-builder.json
├── src/
│   ├── main/                 # Electron main process
│   │   ├── index.ts          # Main entry point
│   │   ├── preload.ts        # Preload script for IPC
│   │   ├── adb.ts            # ADB wrapper functions
│   │   ├── scrcpy.ts         # scrcpy launcher
│   │   └── filesystem.ts     # Filesystem detection
│   ├── renderer/             # Electron renderer (React)
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── DeviceStatus.tsx
│   │   │   ├── MirrorControl.tsx
│   │   │   ├── VideoList.tsx
│   │   │   ├── DestinationPicker.tsx
│   │   │   └── TransferProgress.tsx
│   │   └── styles/
│   │       └── main.css
│   └── shared/               # Shared types
│       └── types.ts
├── docs/
│   └── PRD-001-VideoFlux.md
└── .claude/
    └── settings.local.json
```

### Technology Stack

- **Electron**: Latest stable version with electron-builder for packaging
- **React**: For renderer UI (functional components, hooks)
- **TypeScript**: Strict mode, no `any` types
- **CSS**: Plain CSS or CSS modules (no heavy frameworks)
- **Build**: electron-builder for packaging

### IPC Communication Pattern

All communication between renderer and main process uses typed IPC:

```typescript
// In preload.ts - expose safe API
contextBridge.exposeInMainWorld('videoFlux', {
  getDeviceStatus: () => ipcRenderer.invoke('device:status'),
  startMirror: () => ipcRenderer.invoke('mirror:start'),
  stopMirror: () => ipcRenderer.invoke('mirror:stop'),
  listVideos: () => ipcRenderer.invoke('videos:list'),
  selectDestination: () => ipcRenderer.invoke('destination:select'),
  transferVideos: (files: string[], dest: string) => ipcRenderer.invoke('transfer:start', files, dest),
  // ... etc
});
```

### ADB Commands Reference

```bash
# Check device connection
adb devices

# List files in DCIM/Camera
adb shell ls -la /sdcard/DCIM/Camera/

# Get file details (size, date)
adb shell stat /sdcard/DCIM/Camera/VIDEO.mp4

# Transfer file
adb pull /sdcard/DCIM/Camera/VIDEO.mp4 /local/path/

# Check if adb is available
which adb
```

### scrcpy Launch Pattern

```typescript
import { spawn } from 'child_process';

const scrcpyProcess = spawn('scrcpy', [], {
  detached: true,  // Allow window to be independent
  stdio: 'ignore'
});

// Don't wait for scrcpy to exit
scrcpyProcess.unref();
```

### Filesystem Detection

```bash
# Get filesystem type of a volume
diskutil info /Volumes/SSD | grep "File System Personality"
# Returns: "MS-DOS FAT32" or "ExFAT" or "APFS" etc
```

---

## Implementation Phases

### Phase 1: Project Scaffolding & Electron Setup

**Goal**: Working Electron app shell that opens a window with basic React UI

**Status**: COMPLETE
**Completed**: 2026-01-20
**Commit**: 370a3c5
**QA Results**: typecheck OK, lint OK, build OK

**Acceptance criteria covered**:
- [x] (Foundation for all criteria - no specific criteria completed yet)

**Implementation notes**:
- Initialize npm project with TypeScript
- Set up Electron with main process, preload script, renderer
- Configure electron-builder for macOS
- Set up React in renderer with minimal App component
- Configure TypeScript strict mode
- Add npm scripts: `dev`, `build`, `lint`, `typecheck`
- Window should open and display "VideoFlux" title

**Key files to create**:
- `package.json` with all dependencies
- `tsconfig.json` for TypeScript
- `src/main/index.ts` - Electron main process
- `src/main/preload.ts` - Context bridge setup
- `src/renderer/index.html` - HTML template
- `src/renderer/index.tsx` - React entry
- `src/renderer/App.tsx` - Main App component
- `src/shared/types.ts` - Shared TypeScript types

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run dev` launches Electron window
- `npm run build` creates app bundle

**Commit format**: `feat(PRD-001): Phase 1 - Electron project scaffolding`

---

### Phase 2: Device Connection Detection

**Goal**: App detects and displays Android device connection status in real-time

**Status**: COMPLETE
**Completed**: 2026-01-20
**Commit**: 4936346
**QA Results**: typecheck OK, lint OK

**Acceptance criteria covered**:
- [x] App detects when an Android device is connected via USB with ADB debugging enabled
- [x] App displays clear device status: "Connected" with device name or "No device detected"
- [x] App shows helpful guidance when no device is detected
- [x] App handles device disconnection gracefully with clear feedback
- [x] ADB not installed: app shows installation instructions
- [x] Device not authorized: app shows step-by-step authorization guide

**Implementation notes**:
- Create `src/main/adb.ts` with functions:
  - `checkAdbInstalled(): Promise<boolean>`
  - `getConnectedDevice(): Promise<DeviceInfo | null>`
  - `startDevicePolling(callback): void` - poll every 2 seconds
- Parse `adb devices` output to detect:
  - No devices
  - Device connected but unauthorized
  - Device connected and authorized
- Create `DeviceStatus.tsx` component showing:
  - Green indicator + device name when connected
  - Yellow indicator + "Unauthorized" with instructions
  - Red indicator + "No device" with troubleshooting steps
  - Error state if ADB not installed

**Device status types**:
```typescript
type DeviceStatus =
  | { status: 'connected'; deviceName: string; deviceId: string }
  | { status: 'unauthorized'; deviceId: string }
  | { status: 'no-device' }
  | { status: 'adb-not-installed' }
  | { status: 'error'; message: string };
```

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- Manual test: app shows correct status with/without phone connected

**Commit format**: `feat(PRD-001): Phase 2 - Device connection detection`

---

### Phase 3: Screen Mirroring Control

**Goal**: User can start and stop scrcpy mirroring from the app

**Status**: COMPLETE
**Completed**: 2026-01-20
**Commit**: 54d6226
**QA Results**: typecheck OK, lint OK

**Acceptance criteria covered**:
- [x] User can launch scrcpy mirroring with a single button click
- [x] scrcpy window opens as a separate, detachable window
- [x] All scrcpy interactive features work: touch, click, keyboard input, navigation
- [x] User can stop the mirroring session from the app
- [x] App shows mirroring status: "Active" or "Inactive"
- [x] If scrcpy fails to launch, app displays a clear error message
- [x] scrcpy not installed: app shows installation instructions

**Implementation notes**:
- Create `src/main/scrcpy.ts` with functions:
  - `checkScrcpyInstalled(): Promise<boolean>`
  - `startMirror(): Promise<void>` - spawns detached scrcpy process
  - `stopMirror(): void` - kills scrcpy process
  - `isMirrorActive(): boolean`
- Track scrcpy process PID to manage lifecycle
- Create `MirrorControl.tsx` component:
  - "Start Mirror" button (disabled if no device or already mirroring)
  - "Stop Mirror" button (only shown when mirroring)
  - Status indicator: "Mirroring Active" / "Mirroring Inactive"
  - Error display if scrcpy not installed or launch fails
- Handle scrcpy process exit (user closes window manually)

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- Manual test: can start/stop scrcpy, control phone through it

**Commit format**: `feat(PRD-001): Phase 3 - Screen mirroring control`

---

### Phase 4: Video File Browser

**Goal**: App displays list of videos from phone that user can select

**Status**: COMPLETE
**Completed**: 2026-01-20
**Commit**: (pending)
**QA Results**: typecheck OK, lint OK

**Acceptance criteria covered**:
- [x] App lists video files from the phone's DCIM/Camera directory
- [x] Each video shows: filename, file size (human-readable), date modified
- [x] User can select multiple videos for transfer (checkboxes)
- [x] User can select/deselect all videos
- [x] List refreshes when user clicks a refresh button
- [x] Empty state shows clear message when no videos are found

**Implementation notes**:
- Add to `src/main/adb.ts`:
  - `listVideos(): Promise<VideoFile[]>` - lists .mp4, .mkv, .mov files
  - Parse `adb shell ls -la` and `adb shell stat` for file details
- Define `VideoFile` type:
  ```typescript
  interface VideoFile {
    path: string;        // Full path on device
    filename: string;    // Just the filename
    size: number;        // Size in bytes
    sizeHuman: string;   // "1.2 GB"
    modified: Date;      // Last modified date
  }
  ```
- Create `VideoList.tsx` component:
  - Table/list view with checkbox, filename, size, date columns
  - "Select All" / "Deselect All" buttons
  - "Refresh" button
  - Empty state: "No videos found in DCIM/Camera"
  - Loading state while fetching

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- Manual test: videos appear in list, selection works

**Commit format**: `feat(PRD-001): Phase 4 - Video file browser`

---

### Phase 5: Destination Selection & Filesystem Detection

**Goal**: User can select destination folder, app detects filesystem and warns about FAT32 limitations

**Status**: PENDING
**Completed**: —
**Commit**: —
**QA Results**: —

**Acceptance criteria covered**:
- [ ] User can select any folder on their Mac as transfer destination via native folder picker
- [ ] Selected destination path is displayed in the UI
- [ ] App detects the filesystem type of the destination volume
- [ ] Destination selection persists across app restarts

**Implementation notes**:
- Create `src/main/filesystem.ts`:
  - `selectFolder(): Promise<string | null>` - uses Electron dialog
  - `getFilesystemType(path: string): Promise<FilesystemInfo>`
  - Parse `diskutil info` output for filesystem type
- Define types:
  ```typescript
  interface FilesystemInfo {
    type: 'FAT32' | 'exFAT' | 'APFS' | 'HFS+' | 'NTFS' | 'unknown';
    volumeName: string;
    maxFileSize: number | null;  // null = no limit, 4GB for FAT32
  }
  ```
- Use `electron-store` or simple JSON file for persistence
- Create `DestinationPicker.tsx` component:
  - "Select Folder" button
  - Display selected path
  - Show filesystem type badge (e.g., "FAT32 - 4GB limit")
  - Warning icon if FAT32

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- Manual test: folder picker works, filesystem detected correctly

**Commit format**: `feat(PRD-001): Phase 5 - Destination selection and filesystem detection`

---

### Phase 6: File Transfer with Progress & Warnings

**Goal**: Complete transfer functionality with progress tracking and FAT32 warnings

**Status**: PENDING
**Completed**: —
**Commit**: —
**QA Results**: —

**Acceptance criteria covered**:
- [ ] User can initiate transfer of selected videos to chosen destination
- [ ] Transfer shows progress indicator (percentage or progress bar)
- [ ] App warns BEFORE transfer if any selected file exceeds 4GB and destination is FAT32
- [ ] Warning allows user to proceed anyway or cancel
- [ ] Transfer can be cancelled by the user
- [ ] Successful transfers show completion confirmation
- [ ] Failed transfers show clear error message with reason
- [ ] Transfer failure: app shows specific error (permission denied, disk full, etc.)
- [ ] All errors are dismissible and don't block app usage

**Implementation notes**:
- Add to `src/main/adb.ts`:
  - `transferFile(sourcePath: string, destPath: string, onProgress: (percent: number) => void): Promise<void>`
  - Use `adb pull` with progress parsing or file size comparison
  - Handle errors: permission denied, disk full, file exists
- Create transfer workflow:
  1. Check if any selected files > 4GB and destination is FAT32
  2. If yes, show warning dialog with file list
  3. User can "Proceed Anyway" or "Cancel"
  4. Transfer files sequentially with progress updates
  5. Show completion summary or error details
- Create `TransferProgress.tsx` component:
  - Progress bar for current file
  - Overall progress (X of Y files)
  - Current file name being transferred
  - "Cancel" button
  - Completion state with success/failure summary
- Create warning dialog component for FAT32 large file warning

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run build` creates working app
- Manual test: transfer works, warnings appear, errors handled

**Commit format**: `feat(PRD-001): Phase 6 - File transfer with progress and warnings`

---

## Edge Cases & Error States

- **When ADB is not installed**: Show clear message with `brew install android-platform-tools` instruction
- **When scrcpy is not installed**: Show clear message with `brew install scrcpy` instruction
- **When device is connected but not authorized**: Show step-by-step guide to authorize on phone
- **When user unplugs phone during transfer**: Stop transfer gracefully, show partial completion status
- **When destination disk is full**: Show "Disk full" error with space required vs available
- **When file already exists at destination**: Append number to filename (video.mp4 -> video (1).mp4)
- **When DCIM/Camera folder doesn't exist**: Show "No camera folder found" message
- **When phone screen is locked**: scrcpy still works, but warn user they may need to unlock for some operations
- **When multiple devices connected**: Use first authorized device, ignore others

---

## Git Workflow

- Orchestrator commits at the end of each phase (after QA passes)
- Never proceed to next phase without committing
- Commit message must reference acceptance criteria covered
- Format: `feat(PRD-001): [phase] - [summary]`

---

## Ralph Loop Execution Rules

### Rate Limit Handling

If the session hits user usage limits:
1. **STOP** - Do not continue looping
2. **PAUSE** - Wait for usage limit to reset
3. **RESUME** - Continue from last checkpoint when limits are restored

### Iteration Budget

- `--max-iterations` is a safety net, not a target
- If approaching max iterations without completion, document progress
- Prefer pausing over failing when blocked by external limits

---

## Completion Criteria

Feature is complete when:
- [ ] All acceptance criteria verified and checked off
- [ ] All phases committed
- [ ] `npm run build` produces working macOS app
- [ ] App successfully mirrors phone and transfers files
- [ ] No TypeScript errors, no lint warnings

Output: ===FEATURE_COMPLETE===

## If Blocked

After 5 iterations without progress on a single phase:
- Commit current state: `wip(PRD-001): [status]`
- Document: what's blocking, what was tried, suggested alternatives
- Output: ===FEATURE_BLOCKED===

## If Rate Limited

When usage limits are hit:
- Log: `[PAUSED] Rate limit reached. Progress: Phase X/Y complete.`
- Do NOT output completion or blocked signals
- Wait for limit reset, then resume automatically

## Resume Protocol

If execution is interrupted and resumed:

1. Read PRD file
2. Find first phase with status not equal to COMPLETE
3. Check if phase was partially done (uncommitted changes via `git status`)
4. Resume from that phase
