import type { DeviceStatus, MirrorStatus, VideoFile, DestinationInfo } from '../../shared/types';

interface VideoFluxAPI {
  getDeviceStatus: () => Promise<DeviceStatus>;
  onDeviceStatusChange: (callback: (status: DeviceStatus) => void) => () => void;
  startMirror: () => Promise<MirrorStatus>;
  stopMirror: () => Promise<void>;
  getMirrorStatus: () => Promise<MirrorStatus>;
  onMirrorStatusChange: (callback: (status: MirrorStatus) => void) => () => void;
  listVideos: () => Promise<VideoFile[]>;
  selectDestination: () => Promise<DestinationInfo | null>;
  getDestination: () => Promise<DestinationInfo | null>;
}

declare global {
  interface Window {
    videoFlux: VideoFluxAPI;
  }
}

export {};
