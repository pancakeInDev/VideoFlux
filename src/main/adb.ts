import { exec } from 'child_process';
import { promisify } from 'util';
import type { DeviceStatus } from '../shared/types.js';

const execAsync = promisify(exec);

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
