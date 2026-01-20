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
  thumbnail?: string;
}

export interface FilesystemInfo {
  type: 'FAT32' | 'exFAT' | 'APFS' | 'HFS+' | 'NTFS' | 'unknown';
  volumeName: string;
  maxFileSize: number | null;
}

export interface DestinationInfo {
  path: string;
  filesystem: FilesystemInfo;
}

export interface TransferProgress {
  status: 'idle' | 'checking' | 'transferring' | 'complete' | 'cancelled' | 'error';
  currentFile?: string;
  currentFileIndex?: number;
  totalFiles?: number;
  fileProgress?: number;
  completedFiles?: string[];
  failedFiles?: Array<{ path: string; error: string }>;
  errorMessage?: string;
}

export interface LargeFileWarning {
  files: Array<{ path: string; filename: string; size: number; sizeHuman: string }>;
  filesystemType: string;
}
