import type { DeviceStatus, MirrorStatus } from '../../shared/types';

interface VideoFluxAPI {
  getDeviceStatus: () => Promise<DeviceStatus>;
  onDeviceStatusChange: (callback: (status: DeviceStatus) => void) => () => void;
  startMirror: () => Promise<MirrorStatus>;
  stopMirror: () => Promise<void>;
  getMirrorStatus: () => Promise<MirrorStatus>;
  onMirrorStatusChange: (callback: (status: MirrorStatus) => void) => () => void;
}

declare global {
  interface Window {
    videoFlux: VideoFluxAPI;
  }
}

export {};
