# PRD: VideoFlux UI Redesign & Documentation

## Overview

VideoFlux is a macOS Electron application for YouTube creators who film with their Android phone's rear camera. The app currently has a functional dark-themed UI using inline React styles. This PRD covers a complete UI redesign and comprehensive documentation.

The redesign transforms the current dark theme into a light Apple-style design, inspired by macOS System Preferences. This means white/light gray backgrounds, SF Pro typography via the system font stack, subtle shadows, and refined micro-interactions. The goal is a native-feeling macOS experience that feels at home alongside other Apple applications.

Additionally, once the UI redesign is complete, the project needs comprehensive README documentation targeting both end-users (YouTube creators wanting to use the app) and developers (contributors wanting to build or extend the codebase).

## User Stories

- As a YouTube creator, I want the app to feel native to macOS so that it integrates seamlessly with my workflow
- As a macOS user, I want familiar visual patterns (light backgrounds, system fonts, subtle animations) so that the app doesn't feel foreign
- As a potential user, I want clear README documentation so that I can understand what the app does and how to install it
- As a developer, I want architecture documentation so that I can contribute to the project effectively
- As a contributor, I want a clear guide on how to build from source so that I can set up my development environment

## Acceptance Criteria

### Tailwind CSS Migration

- [x] Tailwind CSS is installed and configured with Vite
- [x] PostCSS is properly configured for Tailwind processing
- [x] All inline React styles are removed from components
- [x] Components use Tailwind utility classes exclusively
- [x] Custom colors and design tokens are defined in tailwind.config.js
- [x] No CSS-in-JS or inline style objects remain in any component

### Apple-Style Light Theme

- [x] Background uses light colors: white (#FFFFFF) and light gray (#F5F5F7)
- [x] Typography uses SF Pro via `-apple-system, BlinkMacSystemFont` font stack
- [x] Text colors follow Apple conventions: primary (#1D1D1F), secondary (#86868B)
- [x] Cards and containers use subtle shadows instead of colored backgrounds
- [x] Accent color is Apple blue (#007AFF) for primary actions
- [x] Status indicators use semantic colors: green (#34C759), yellow (#FF9500), red (#FF3B30)
- [x] Border radius follows Apple conventions (8px for cards, 6px for buttons)
- [x] Overall visual impression matches macOS System Preferences aesthetic

### Animations & Micro-interactions

- [x] Buttons have smooth hover state transitions (150-200ms ease)
- [x] Focus states are visible and use ring styling
- [x] Loading states use subtle opacity or spinner animations
- [x] Status indicator dots have a subtle pulse animation when active
- [x] Card hover states have subtle lift effect (translateY + shadow change)
- [x] Transitions feel snappy, not sluggish (no transition longer than 300ms)

### Component Refactoring

- [x] App.tsx refactored with proper layout structure using Tailwind
- [x] DeviceStatus.tsx redesigned with Apple-style card and status indicators
- [x] MirrorControl.tsx redesigned with proper button hierarchy
- [x] VideoList.tsx redesigned with clean table styling and selection UX
- [x] DestinationPicker.tsx redesigned with path display and folder icon
- [x] TransferProgress.tsx redesigned with Apple-style progress bar
- [x] LargeFileWarning.tsx redesigned as Apple-style modal/sheet
- [x] All components pass TypeScript strict mode checks

### README Documentation

- [x] README includes project title with logo/banner placeholder
- [x] README has clear feature list with descriptions
- [x] README includes high-quality screenshots of the redesigned UI
- [x] README documents system requirements (macOS version, dependencies)
- [x] README provides DMG installation instructions for end users
- [x] README documents Homebrew prerequisite installation (adb, scrcpy)
- [x] README includes build-from-source instructions for developers
- [x] README documents Apple code signing (if applicable, or notes it's unsigned)
- [x] README includes architecture overview with folder structure
- [x] README has contribution guidelines
- [x] README includes license information
- [x] README is well-formatted with proper Markdown hierarchy

### Error Handling (Visual)

- [x] Error states use Apple-style inline alerts (not modals for minor errors)
- [x] Installation guidance (ADB/scrcpy missing) is visually clear
- [x] Empty states have helpful illustrations or icons
- [x] All error messages are dismissible

## Scope

### In Scope

- Tailwind CSS installation and configuration
- Complete UI redesign of all existing components
- Light Apple-style theme implementation
- Subtle animations and hover states
- README.md creation with screenshots
- Architecture documentation
- Installation and contribution guides

### Out of Scope

- Dark mode toggle (future feature, not in this PRD)
- Responsive design (desktop-only, fixed width is acceptable)
- New features or functionality changes
- Backend/IPC changes (purely visual redesign)
- i18n/localization
- Automated testing for visual regression

## Constraints

- **Tailwind CSS**: Must use Tailwind for all styling - no inline styles, no CSS modules
- **System Font**: Must use `-apple-system` font stack, no custom font imports
- **No External UI Libraries**: No shadcn, Radix, or component libraries - pure Tailwind
- **Screenshots Required**: README must include actual screenshots, not placeholders
- **macOS Only**: Design optimized for macOS, no Windows/Linux considerations

---

## Execution Architecture

### CRITICAL: Flat Agent Hierarchy

Subagents CANNOT spawn other subagents. Only the Orchestrator can spawn agents.
```
Orchestrator (owns this PRD)
|
|- spawns -> Phase 1 Agent (Tailwind setup)
|- runs QA checks directly (typecheck, lint, dev server)
|- commits Phase 1
|
|- spawns -> Phase 2 Agent (Component migration)
|- runs QA checks directly
|- spawns -> qa-e2e-runtime (validates rendering)
|- commits Phase 2
|
|- spawns -> Phase 3 Agent (Polish & animations)
|- runs QA checks directly
|- spawns -> qa-ui-interaction (validates interactions)
|- commits Phase 3
|
|- spawns -> Phase 4 Agent (README creation)
|- runs QA checks directly
|- commits Phase 4
```

### Orchestrator Responsibilities

1. Read this PRD and maintain global context
2. Spawn Phase Agents ONE AT A TIME with isolated context
3. After each Phase Agent completes, run QA checks DIRECTLY
4. Spawn QA agents as specified per phase (qa-e2e-runtime, qa-ui-interaction)
5. If QA fails, re-spawn Phase Agent with fix instructions
6. **Update PRD file**: check completed criteria, update phase status
7. Commit only after Phase + QA pass
8. Proceed to next phase

### Phase Agent Behavior

Phase Agents receive:
- Phase goal and acceptance criteria
- Implementation guidelines
- QA requirements to satisfy

Phase Agents:
- Implement following TDD approach where applicable
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
     - npm run dev (verify it starts)
  4. Spawn QA agents as specified in phase
  5. IF any QA fails:
       - Spawn Phase Agent again with fix instructions
       - Repeat from step 3
  6. Update PRD file (check criteria, update phase status)
  7. Commit phase
  8. Continue to next phase
```

---

## Progress Tracking

### CRITICAL: PRD as Living Document

The Orchestrator MUST update this PRD file incrementally during execution:

1. **After each acceptance criterion is verified**: Check the box `[ ]` -> `[x]`
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
   **QA Results**: typecheck OK, lint OK, qa-e2e-runtime PASS

4. Write updated PRD file
5. Proceed to next phase
```

### Current Progress

**Started**: 2026-01-20
**Current Phase**: 4 / 4
**Last Updated**: 2026-01-20

---

## Guidelines for Implementation

### Quality Principles

- Analyze existing component structure before refactoring
- Maintain all existing functionality - this is a visual-only change
- Keep IPC contracts unchanged
- Test each component renders correctly after migration
- Verify all interactive states work (disabled, loading, active, etc.)

### TDD Approach

For each component migration:
1. Verify component renders in current state (dev server)
2. Migrate to Tailwind
3. Verify component still renders correctly
4. Verify all states display properly
5. Verify interactions still work

### Design System Reference

**Colors (Apple-inspired)**:
```javascript
// tailwind.config.js theme extension
colors: {
  apple: {
    bg: '#FFFFFF',
    'bg-secondary': '#F5F5F7',
    'text-primary': '#1D1D1F',
    'text-secondary': '#86868B',
    blue: '#007AFF',
    green: '#34C759',
    yellow: '#FF9500',
    red: '#FF3B30',
    'border': '#D2D2D7',
  }
}
```

**Typography**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

**Shadows**:
```javascript
boxShadow: {
  'apple-sm': '0 1px 3px rgba(0,0,0,0.08)',
  'apple': '0 2px 8px rgba(0,0,0,0.08)',
  'apple-lg': '0 4px 16px rgba(0,0,0,0.12)',
}
```

**Border Radius**:
- Cards: 12px (rounded-xl)
- Buttons: 8px (rounded-lg)
- Inputs: 6px (rounded-md)
- Status dots: full (rounded-full)

### Component Migration Pattern

For each component:
1. Remove all `const xxxStyle: React.CSSProperties = {...}` declarations
2. Replace `style={xxxStyle}` with `className="..."`
3. Convert style properties to Tailwind utilities:
   - `display: 'flex'` -> `flex`
   - `backgroundColor: '#...'` -> `bg-apple-bg` or custom
   - `padding: '16px 24px'` -> `px-6 py-4`
   - `fontSize: '1rem'` -> `text-base`
   - etc.
4. Add transition utilities for animations
5. Add hover/focus variants

---

## Implementation Phases

### Phase 1: Tailwind CSS Setup

**Goal**: Tailwind CSS installed and configured, ready for component migration

**Status**: COMPLETE
**Completed**: 2026-01-20
**Commit**: 9c939a6
**QA Results**: typecheck OK, lint OK, dev server OK

**Acceptance criteria covered**:
- [x] Tailwind CSS is installed and configured with Vite
- [x] PostCSS is properly configured for Tailwind processing
- [x] Custom colors and design tokens are defined in tailwind.config.js

**Implementation notes**:

1. Install dependencies:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configure `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        apple: {
          bg: '#FFFFFF',
          'bg-secondary': '#F5F5F7',
          'text-primary': '#1D1D1F',
          'text-secondary': '#86868B',
          blue: '#007AFF',
          green: '#34C759',
          yellow: '#FF9500',
          red: '#FF3B30',
          border: '#D2D2D7',
        }
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0,0,0,0.08)',
        'apple': '0 2px 8px rgba(0,0,0,0.08)',
        'apple-lg': '0 4px 16px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
```

3. Create `src/renderer/styles/main.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Import CSS in `src/renderer/index.tsx`:
```typescript
import './styles/main.css';
```

5. Create a test component or modify App.tsx minimally to verify Tailwind works:
   - Add a simple `className="bg-apple-bg text-apple-text-primary"` to verify

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run dev` starts without errors
- Tailwind classes apply correctly (verify in browser)

**Commit format**: `feat(PRD-002): Phase 1 - Tailwind CSS setup and configuration`

---

### Phase 2: Component Migration to Tailwind

**Goal**: All components migrated from inline styles to Tailwind with Apple-style light theme

**Status**: COMPLETE
**Completed**: 2026-01-20
**Commit**: ebfeac4
**QA Results**: typecheck OK, lint OK, components render in Electron

**Acceptance criteria covered**:
- [x] All inline React styles are removed from components
- [x] Components use Tailwind utility classes exclusively
- [x] No CSS-in-JS or inline style objects remain in any component
- [x] Background uses light colors: white (#FFFFFF) and light gray (#F5F5F7)
- [x] Typography uses SF Pro via `-apple-system` font stack
- [x] Text colors follow Apple conventions
- [x] Cards and containers use subtle shadows
- [x] Accent color is Apple blue (#007AFF) for primary actions
- [x] Status indicators use semantic colors
- [x] Border radius follows Apple conventions
- [x] App.tsx refactored with proper layout structure
- [x] DeviceStatus.tsx redesigned
- [x] MirrorControl.tsx redesigned
- [x] VideoList.tsx redesigned
- [x] DestinationPicker.tsx redesigned
- [x] TransferProgress.tsx redesigned
- [x] LargeFileWarning.tsx redesigned
- [x] All components pass TypeScript strict mode checks

**Implementation notes**:

Migrate components in this order (dependencies first):

1. **App.tsx** - Main layout container
   - Light gray background for the app
   - Centered content with max-width
   - Proper spacing between sections
   - Remove all inline style objects

2. **DeviceStatus.tsx** - Device connection card
   - White card with subtle shadow
   - Status dot with semantic colors
   - Clean typography hierarchy
   - Remove all inline style objects

3. **MirrorControl.tsx** - Mirror button and status
   - Primary button with Apple blue
   - Secondary/danger button variants
   - Proper disabled states
   - Remove all inline style objects

4. **VideoList.tsx** - Video table and selection
   - Clean table with subtle borders
   - Checkbox styling
   - Button group with proper spacing
   - Remove all inline style objects (including dangerButtonStyle, etc.)

5. **DestinationPicker.tsx** - Folder selection
   - Path display with folder icon placeholder
   - Filesystem badge styling
   - Remove all inline style objects

6. **TransferProgress.tsx** - Progress display
   - Apple-style progress bar (thin, rounded)
   - Status cards with proper hierarchy
   - Remove all inline style objects

7. **LargeFileWarning.tsx** - Warning modal
   - Modal overlay with blur
   - Clean card design
   - Button hierarchy (cancel secondary, proceed primary)
   - Remove all inline style objects

**Component class patterns to use**:

Card container:
```tsx
<div className="bg-white rounded-xl shadow-apple p-6">
```

Primary button:
```tsx
<button className="bg-apple-blue text-white px-4 py-2 rounded-lg font-medium
  hover:bg-blue-600 transition-colors duration-150
  disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
```

Secondary button:
```tsx
<button className="bg-apple-bg-secondary text-apple-text-primary px-4 py-2 rounded-lg font-medium
  hover:bg-gray-200 transition-colors duration-150">
```

Danger button:
```tsx
<button className="bg-apple-red text-white px-4 py-2 rounded-lg font-medium
  hover:bg-red-600 transition-colors duration-150">
```

Status indicator:
```tsx
<div className="w-3 h-3 rounded-full bg-apple-green" />
```

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run dev` shows light-themed UI
- All components render correctly

**QA agents to run after**: qa-e2e-runtime

**Commit format**: `feat(PRD-002): Phase 2 - Component migration to Tailwind with Apple-style theme`

---

### Phase 3: Animations & Polish

**Goal**: Smooth animations, micro-interactions, and visual polish

**Status**: COMPLETE
**Completed**: 2026-01-20
**Commit**: 06c780b
**QA Results**: typecheck OK, lint OK

**Acceptance criteria covered**:
- [x] Buttons have smooth hover state transitions (150-200ms ease)
- [x] Focus states are visible and use ring styling
- [x] Loading states use subtle opacity or spinner animations
- [x] Status indicator dots have a subtle pulse animation when active
- [x] Card hover states have subtle lift effect
- [x] Transitions feel snappy, not sluggish
- [x] Overall visual impression matches macOS System Preferences aesthetic
- [x] Error states use Apple-style inline alerts
- [x] Installation guidance is visually clear
- [x] Empty states have helpful icons
- [x] All error messages are dismissible

**Implementation notes**:

1. **Button transitions** - Already added in Phase 2, verify they're 150ms:
```tsx
className="... transition-colors duration-150"
```

2. **Focus states** - Add focus-visible ring:
```tsx
className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2"
```

3. **Loading spinner** - Add a simple CSS spinner animation to `main.css`:
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
```

4. **Status dot pulse** - Add pulse animation for active states:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
Apply to connected status dot

5. **Card hover lift**:
```tsx
className="... hover:-translate-y-0.5 hover:shadow-apple-lg transition-all duration-200"
```

6. **Empty states** - Add SVG icons or emoji for empty/error states
   - No videos: folder icon with "No videos found"
   - No device: phone icon with connection guidance
   - ADB not installed: terminal icon with brew command

7. **Error dismissal** - Ensure all error states have dismiss action

**QA checks**:
- `npm run typecheck` passes
- `npm run lint` passes
- Manual verification of all animations
- Verify focus states are accessible

**QA agents to run after**: qa-ui-interaction

**Commit format**: `feat(PRD-002): Phase 3 - Animations and visual polish`

---

### Phase 4: README Documentation

**Goal**: Comprehensive README with screenshots, installation, and contribution guides

**Status**: COMPLETE
**Completed**: 2026-01-20
**Commit**: 82c6ae0
**QA Results**: typecheck OK, lint OK, build OK

**Acceptance criteria covered**:
- [x] README includes project title with logo/banner placeholder
- [x] README has clear feature list with descriptions
- [x] README includes high-quality screenshots of the redesigned UI
- [x] README documents system requirements
- [x] README provides DMG installation instructions
- [x] README documents Homebrew prerequisite installation
- [x] README includes build-from-source instructions
- [x] README documents Apple code signing status
- [x] README includes architecture overview
- [x] README has contribution guidelines
- [x] README includes license information
- [x] README is well-formatted with proper Markdown hierarchy

**Implementation notes**:

1. **Take screenshots** of the redesigned app:
   - Run `npm run dev`
   - Take screenshots of:
     - Main view with no device connected
     - Device connected state
     - Video list with selections
     - Transfer in progress
     - Transfer complete
   - Save to `docs/screenshots/` directory
   - Use PNG format, reasonable dimensions (800-1200px width)

2. **Create README.md** with this structure:

```markdown
# VideoFlux

> Mirror your Android phone screen and transfer videos to your Mac

[Screenshot banner here]

## Features

- **Screen Mirroring** - See your phone's camera preview on your Mac
- **Phone Control** - Control your phone from your Mac
- **Video Transfer** - Transfer videos with progress tracking
- **Smart Warnings** - FAT32 file size limit detection

## Requirements

- macOS 11.0 (Big Sur) or later
- Android phone with USB debugging enabled
- USB cable

## Installation

### Prerequisites

Install required tools via Homebrew:

\`\`\`bash
brew install android-platform-tools scrcpy
\`\`\`

### Download

1. Download the latest DMG from [Releases](link)
2. Open the DMG and drag VideoFlux to Applications
3. **First launch**: Right-click > Open (app is unsigned)

### Build from Source

\`\`\`bash
git clone <repo>
cd VideoFlux
npm install
npm run build
\`\`\`

## Usage

[Screenshots and instructions]

## Architecture

\`\`\`
src/
├── main/           # Electron main process
│   ├── index.ts    # Entry point, window management
│   ├── preload.ts  # IPC bridge
│   ├── adb.ts      # ADB wrapper functions
│   ├── scrcpy.ts   # scrcpy launcher
│   └── filesystem.ts
├── renderer/       # React UI
│   ├── App.tsx     # Main component
│   └── components/ # UI components
└── shared/         # Shared TypeScript types
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run typecheck && npm run lint`
5. Submit a pull request

## License

[License info]
```

3. **Architecture diagram** (optional ASCII art or mermaid)

4. **Code signing note**: Document that the app is unsigned and users need to right-click > Open on first launch, OR document the signing process if available.

**QA checks**:
- README renders correctly in GitHub preview
- All links work (relative paths)
- Screenshots are present and load
- Code blocks are properly formatted
- No spelling/grammar errors

**Commit format**: `docs(PRD-002): Phase 4 - README documentation with screenshots`

---

## Edge Cases & Error States

- **When Tailwind build fails**: Check postcss.config.js and tailwind.config.js paths
- **When styles don't apply**: Verify content paths in tailwind.config.js include all component files
- **When dark mode persists**: Clear browser cache, verify no conflicting CSS
- **When screenshots are blurry**: Capture on Retina display at 2x, save as PNG
- **When README images don't load**: Use relative paths from repo root

---

## Git Workflow

- Orchestrator commits at the end of each phase (after QA passes)
- Never proceed to next phase without committing
- Commit message must reference PRD-002
- Format: `feat(PRD-002): [phase] - [summary]` or `docs(PRD-002): [phase] - [summary]`

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
- [x] All acceptance criteria verified and checked off
- [x] All phases committed
- [x] `npm run build` produces working macOS app with new UI
- [x] App displays light Apple-style theme
- [x] README.md is complete with screenshots
- [x] No TypeScript errors, no lint warnings

Output: ===FEATURE_COMPLETE===

## If Blocked

After 5 iterations without progress on a single phase:
- Commit current state: `wip(PRD-002): [status]`
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
