import type { DeviceStatus, MirrorStatus, VideoFile, DestinationInfo, TransferProgress, LargeFileWarning } from '../shared/types';

interface TransferStartResult {
  needsWarning: boolean;
  largeFiles?: LargeFileWarning;
  started?: boolean;
}

interface VideoFluxAPI {
  getDeviceStatus: () => Promise<DeviceStatus>;
  onDeviceStatusChange: (callback: (status: DeviceStatus) => void) => () => void;
  startMirror: () => Promise<MirrorStatus>;
  stopMirror: () => Promise<void>;
  getMirrorStatus: () => Promise<MirrorStatus>;
  onMirrorStatusChange: (callback: (status: MirrorStatus) => void) => () => void;
  listVideos: () => Promise<VideoFile[]>;
  getVideoThumbnail: (videoPath: string) => Promise<string | undefined>;
  deleteVideos: (filePaths: string[]) => Promise<{ deleted: string[]; failed: Array<{ path: string; error: string }> }>;
  selectDestination: () => Promise<DestinationInfo | null>;
  getDestination: () => Promise<DestinationInfo | null>;
  startTransfer: (files: string[], destPath: string, filesystemType: string) => Promise<TransferStartResult>;
  confirmTransfer: () => Promise<boolean>;
  cancelTransfer: () => Promise<void>;
  onTransferProgress: (callback: (progress: TransferProgress) => void) => () => void;
}

const mockVideos: VideoFile[] = [
  {
    path: '/sdcard/DCIM/Camera/VID_20260120_143022.mp4',
    filename: 'VID_20260120_143022.mp4',
    size: 256000000,
    sizeHuman: '256 MB',
    modified: new Date('2026-01-20T14:30:22'),
  },
  {
    path: '/sdcard/DCIM/Camera/VID_20260119_091544.mp4',
    filename: 'VID_20260119_091544.mp4',
    size: 128000000,
    sizeHuman: '128 MB',
    modified: new Date('2026-01-19T09:15:44'),
  },
  {
    path: '/sdcard/DCIM/Camera/VID_20260118_182233.mp4',
    filename: 'VID_20260118_182233.mp4',
    size: 512000000,
    sizeHuman: '512 MB',
    modified: new Date('2026-01-18T18:22:33'),
  },
  {
    path: '/sdcard/DCIM/Camera/VID_20260115_103015.mp4',
    filename: 'VID_20260115_103015.mp4',
    size: 64000000,
    sizeHuman: '64 MB',
    modified: new Date('2026-01-15T10:30:15'),
  },
];

export const mockVideoFluxAPI: VideoFluxAPI = {
  getDeviceStatus: async () => ({
    status: 'connected',
    deviceName: 'Pixel 8 Pro (Demo)',
    deviceId: 'demo-device-001',
  }),

  onDeviceStatusChange: () => () => {},

  startMirror: async () => ({ status: 'active' }),

  stopMirror: async () => {},

  getMirrorStatus: async () => ({ status: 'inactive' }),

  onMirrorStatusChange: () => () => {},

  listVideos: async () => mockVideos,

  getVideoThumbnail: async () => undefined,

  deleteVideos: async (filePaths) => ({
    deleted: filePaths,
    failed: [],
  }),

  selectDestination: async () => ({
    path: '/Users/demo/Videos',
    filesystem: { type: 'APFS', name: 'Macintosh HD' },
  }),

  getDestination: async () => null,

  startTransfer: async () => ({ needsWarning: false, started: true }),

  confirmTransfer: async () => true,

  cancelTransfer: async () => {},

  onTransferProgress: () => () => {},
};

export function initMockApi(): void {
  if (typeof window !== 'undefined' && !window.videoFlux) {
    console.log('[VideoFlux] Running in browser mode with mock API');
    window.videoFlux = mockVideoFluxAPI;
  }
}
