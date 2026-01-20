import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import type { DeviceStatus, VideoFile } from '../shared/types.js';

const execAsync = promisify(exec);
const statAsync = promisify(fs.stat);
const accessAsync = promisify(fs.access);

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.mov', '.3gp'];
const DCIM_CAMERA_PATH = '/sdcard/DCIM/Camera';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function parseDate(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export async function checkAdbInstalled(): Promise<boolean> {
  try {
    await execAsync('which adb');
    return true;
  } catch {
    return false;
  }
}

export async function getDeviceName(deviceId: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`adb -s ${deviceId} shell getprop ro.product.model`);
    return stdout.trim() || 'Unknown Device';
  } catch {
    return 'Unknown Device';
  }
}

export async function getConnectedDevice(): Promise<DeviceStatus> {
  const adbInstalled = await checkAdbInstalled();
  if (!adbInstalled) {
    return { status: 'adb-not-installed' };
  }

  try {
    const { stdout } = await execAsync('adb devices');
    const lines = stdout.trim().split('\n');

    const deviceLines = lines.slice(1).filter(line => line.trim().length > 0);

    if (deviceLines.length === 0) {
      return { status: 'no-device' };
    }

    const firstDevice = deviceLines[0];
    const parts = firstDevice.split('\t');

    if (parts.length < 2) {
      return { status: 'no-device' };
    }

    const deviceId = parts[0].trim();
    const deviceState = parts[1].trim();

    if (deviceState === 'unauthorized') {
      return { status: 'unauthorized', deviceId };
    }

    if (deviceState === 'device') {
      const deviceName = await getDeviceName(deviceId);
      return { status: 'connected', deviceName, deviceId };
    }

    return { status: 'no-device' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { status: 'error', message };
  }
}

async function getVideoMediaId(videoPath: string): Promise<string | undefined> {
  try {
    const filename = path.basename(videoPath, path.extname(videoPath));
    const { stdout } = await execAsync(
      `adb shell "content query --uri content://media/external/video/media --projection _id --where \\"_data LIKE '%${filename}%'\\""`
    );
    const match = stdout.match(/_id=(\d+)/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

export async function getVideoThumbnail(videoPath: string): Promise<string | undefined> {
  const mediaId = await getVideoMediaId(videoPath);
  if (!mediaId) {
    return undefined;
  }

  return new Promise((resolve) => {
    const child = spawn('adb', [
      'shell',
      `content read --uri content://media/external/video/media/${mediaId}/thumbnail`
    ]);

    const chunks: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));

    child.on('close', (code) => {
      const output = Buffer.concat(chunks);
      if (code === 0 && output.length > 500) {
        resolve(`data:image/jpeg;base64,${output.toString('base64')}`);
      } else {
        resolve(undefined);
      }
    });

    child.on('error', () => resolve(undefined));

    setTimeout(() => {
      child.kill('SIGKILL');
      resolve(undefined);
    }, 10000);
  });
}

export async function listVideos(): Promise<VideoFile[]> {
  const adbInstalled = await checkAdbInstalled();
  if (!adbInstalled) {
    return [];
  }

  try {
    const { stdout } = await execAsync(`adb shell ls -la "${DCIM_CAMERA_PATH}/"`);
    const lines = stdout.trim().split('\n');
    const videos: VideoFile[] = [];

    for (const line of lines) {
      if (line.startsWith('d') || line.startsWith('total')) continue;

      const parts = line.trim().split(/\s+/);
      if (parts.length < 7) continue;

      const size = parseInt(parts[4], 10);
      const dateStr = parts[5];
      const timeStr = parts[6];
      const filename = parts.slice(7).join(' ');

      if (!filename || filename === '.' || filename === '..') continue;

      const lowerFilename = filename.toLowerCase();
      const isVideo = VIDEO_EXTENSIONS.some(ext => lowerFilename.endsWith(ext));
      if (!isVideo) continue;

      videos.push({
        path: `${DCIM_CAMERA_PATH}/${filename}`,
        filename,
        size,
        sizeHuman: formatBytes(size),
        modified: parseDate(dateStr, timeStr),
      });
    }

    videos.sort((a, b) => b.modified.getTime() - a.modified.getTime());

    return videos;
  } catch {
    return [];
  }
}

export async function getFileSize(sourcePath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(`adb shell stat -c %s "${sourcePath}"`);
    return parseInt(stdout.trim(), 10);
  } catch {
    return 0;
  }
}

async function getUniquePath(basePath: string): Promise<string> {
  const dir = path.dirname(basePath);
  const ext = path.extname(basePath);
  const nameWithoutExt = path.basename(basePath, ext);

  let candidate = basePath;
  let counter = 1;

  for (;;) {
    try {
      await accessAsync(candidate, fs.constants.F_OK);
      candidate = path.join(dir, `${nameWithoutExt} (${counter})${ext}`);
      counter++;
    } catch {
      return candidate;
    }
  }
}

export interface TransferResult {
  success: boolean;
  destPath?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export async function deleteFile(filePath: string): Promise<DeleteResult> {
  const adbInstalled = await checkAdbInstalled();
  if (!adbInstalled) {
    return { success: false, error: 'ADB not installed' };
  }

  try {
    const { stderr } = await execAsync(`adb shell rm "${filePath}"`);

    if (stderr && stderr.trim()) {
      return { success: false, error: `Delete failed: ${stderr.trim()}` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('No such file')) {
      return { success: false, error: 'File not found on device' };
    }
    if (message.includes('Permission denied')) {
      return { success: false, error: 'Permission denied' };
    }
    if (message.includes('Read-only file system')) {
      return { success: false, error: 'Read-only file system' };
    }
    return { success: false, error: `Delete failed: ${message}` };
  }
}

export async function deleteFiles(filePaths: string[]): Promise<{ deleted: string[]; failed: Array<{ path: string; error: string }> }> {
  const deleted: string[] = [];
  const failed: Array<{ path: string; error: string }> = [];

  for (const filePath of filePaths) {
    const result = await deleteFile(filePath);

    if (result.success) {
      deleted.push(filePath);
    } else {
      failed.push({ path: filePath, error: result.error || 'Unknown error' });
    }
  }

  return { deleted, failed };
}

export async function transferFile(
  sourcePath: string,
  destDir: string,
  onProgress?: (percent: number) => void
): Promise<TransferResult> {
  const adbInstalled = await checkAdbInstalled();
  if (!adbInstalled) {
    return { success: false, error: 'ADB not installed' };
  }

  const filename = path.basename(sourcePath);
  let destPath = path.join(destDir, filename);

  try {
    destPath = await getUniquePath(destPath);
  } catch (err) {
    return {
      success: false,
      error: `Permission denied: Cannot write to destination folder`,
    };
  }

  const sourceSize = await getFileSize(sourcePath);
  if (sourceSize === 0) {
    return { success: false, error: 'Cannot read source file size' };
  }

  onProgress?.(0);

  return new Promise((resolve) => {
    const adbProcess = spawn('adb', ['pull', sourcePath, destPath]);
    let errorOutput = '';

    const progressInterval = setInterval(async () => {
      try {
        const stats = await statAsync(destPath);
        const percent = Math.min(99, Math.floor((stats.size / sourceSize) * 100));
        onProgress?.(percent);
      } catch {
        // File might not exist yet
      }
    }, 500);

    adbProcess.stderr.on('data', (data: Buffer) => {
      errorOutput += data.toString();
    });

    adbProcess.on('close', async (code) => {
      clearInterval(progressInterval);

      if (code === 0) {
        onProgress?.(100);
        resolve({ success: true, destPath });
      } else {
        try {
          await accessAsync(destPath, fs.constants.F_OK);
          fs.unlinkSync(destPath);
        } catch {
          // File doesn't exist, nothing to clean up
        }

        let errorMessage = 'Transfer failed';
        if (errorOutput.includes('Permission denied')) {
          errorMessage = 'Permission denied: Cannot write to destination folder';
        } else if (errorOutput.includes('No space left')) {
          errorMessage = 'Disk full: Not enough space on destination';
        } else if (errorOutput.includes('does not exist')) {
          errorMessage = 'Source file not found on device';
        } else if (errorOutput.trim()) {
          errorMessage = `Transfer failed: ${errorOutput.trim()}`;
        }

        resolve({ success: false, error: errorMessage });
      }
    });

    adbProcess.on('error', (err) => {
      clearInterval(progressInterval);
      resolve({ success: false, error: `Transfer failed: ${err.message}` });
    });
  });
}
