import type { DeviceStatus, MirrorStatus, VideoFile, DestinationInfo, TransferProgress, LargeFileWarning } from '../../shared/types';

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
  deleteVideos: (filePaths: string[]) => Promise<{ deleted: string[]; failed: Array<{ path: string; error: string }> }>;
  selectDestination: () => Promise<DestinationInfo | null>;
  getDestination: () => Promise<DestinationInfo | null>;
  startTransfer: (files: string[], destPath: string, filesystemType: string) => Promise<TransferStartResult>;
  confirmTransfer: () => Promise<boolean>;
  cancelTransfer: () => Promise<void>;
  onTransferProgress: (callback: (progress: TransferProgress) => void) => () => void;
}

declare global {
  interface Window {
    videoFlux: VideoFluxAPI;
  }
}

export {};
