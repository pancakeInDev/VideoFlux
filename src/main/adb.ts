import { exec } from 'child_process';
import { promisify } from 'util';
import type { DeviceStatus, VideoFile } from '../shared/types.js';

const execAsync = promisify(exec);

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
