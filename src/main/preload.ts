import { contextBridge, ipcRenderer } from 'electron';
import type { DeviceStatus, MirrorStatus, VideoFile, DestinationInfo } from '../shared/types.js';

contextBridge.exposeInMainWorld('videoFlux', {
  getDeviceStatus: (): Promise<DeviceStatus> => ipcRenderer.invoke('device:status'),
  onDeviceStatusChange: (callback: (status: DeviceStatus) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, status: DeviceStatus) => callback(status);
    ipcRenderer.on('device:status-changed', handler);
    return () => {
      ipcRenderer.removeListener('device:status-changed', handler);
    };
  },

  startMirror: (): Promise<MirrorStatus> => ipcRenderer.invoke('mirror:start'),
  stopMirror: (): Promise<void> => ipcRenderer.invoke('mirror:stop'),
  getMirrorStatus: (): Promise<MirrorStatus> => ipcRenderer.invoke('mirror:status'),
  onMirrorStatusChange: (callback: (status: MirrorStatus) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, status: MirrorStatus) => callback(status);
    ipcRenderer.on('mirror:status-changed', handler);
    return () => {
      ipcRenderer.removeListener('mirror:status-changed', handler);
    };
  },

  listVideos: (): Promise<VideoFile[]> => ipcRenderer.invoke('videos:list'),

  selectDestination: (): Promise<DestinationInfo | null> => ipcRenderer.invoke('destination:select'),
  getDestination: (): Promise<DestinationInfo | null> => ipcRenderer.invoke('destination:get'),
});
