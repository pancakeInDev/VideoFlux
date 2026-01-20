import type { DeviceStatus } from '../../shared/types';

interface VideoFluxAPI {
  getDeviceStatus: () => Promise<DeviceStatus>;
  onDeviceStatusChange: (callback: (status: DeviceStatus) => void) => () => void;
}

declare global {
  interface Window {
    videoFlux: VideoFluxAPI;
  }
}

export {};
