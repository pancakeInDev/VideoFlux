import { contextBridge, ipcRenderer } from 'electron';
import type { DeviceStatus } from '../shared/types.js';

contextBridge.exposeInMainWorld('videoFlux', {
  getDeviceStatus: (): Promise<DeviceStatus> => ipcRenderer.invoke('device:status'),
  onDeviceStatusChange: (callback: (status: DeviceStatus) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, status: DeviceStatus) => callback(status);
    ipcRenderer.on('device:status-changed', handler);
    return () => {
      ipcRenderer.removeListener('device:status-changed', handler);
    };
  },
});
