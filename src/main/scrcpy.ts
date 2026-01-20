import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import type { MirrorStatus } from '../shared/types.js';

const execAsync = promisify(exec);

let scrcpyProcess: ChildProcess | null = null;
let onProcessExit: (() => void) | null = null;

export async function checkScrcpyInstalled(): Promise<boolean> {
  try {
    await execAsync('which scrcpy');
    return true;
  } catch {
    return false;
  }
}

export function isMirrorActive(): boolean {
  return scrcpyProcess !== null && scrcpyProcess.exitCode === null;
}

export function getMirrorStatus(): MirrorStatus {
  if (isMirrorActive()) {
    return { status: 'active' };
  }
  return { status: 'inactive' };
}

export async function startMirror(onExit?: () => void): Promise<MirrorStatus> {
  if (isMirrorActive()) {
    return { status: 'active' };
  }

  const installed = await checkScrcpyInstalled();
  if (!installed) {
    return { status: 'scrcpy-not-installed' };
  }

  try {
    scrcpyProcess = spawn('scrcpy', [], {
      detached: true,
      stdio: 'ignore',
    });

    scrcpyProcess.unref();

    onProcessExit = onExit || null;

    scrcpyProcess.on('exit', () => {
      scrcpyProcess = null;
      if (onProcessExit) {
        onProcessExit();
        onProcessExit = null;
      }
    });

    scrcpyProcess.on('error', () => {
      scrcpyProcess = null;
      if (onProcessExit) {
        onProcessExit();
        onProcessExit = null;
      }
    });

    return { status: 'active' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start scrcpy';
    return { status: 'error', message };
  }
}

export function stopMirror(): void {
  if (scrcpyProcess && scrcpyProcess.pid) {
    try {
      process.kill(-scrcpyProcess.pid, 'SIGTERM');
    } catch {
      try {
        scrcpyProcess.kill('SIGTERM');
      } catch {
        // Process already dead
      }
    }
    scrcpyProcess = null;
    onProcessExit = null;
  }
}

export function cleanupOnQuit(): void {
  stopMirror();
}
