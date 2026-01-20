export type DeviceStatus =
  | { status: 'connected'; deviceName: string; deviceId: string }
  | { status: 'unauthorized'; deviceId: string }
  | { status: 'no-device' }
  | { status: 'adb-not-installed' }
  | { status: 'error'; message: string };

export type MirrorStatus =
  | { status: 'inactive' }
  | { status: 'active' }
  | { status: 'starting' }
  | { status: 'error'; message: string }
  | { status: 'scrcpy-not-installed' };

export interface VideoFile {
  path: string;
  filename: string;
  size: number;
  sizeHuman: string;
  modified: Date;
}
