import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { getConnectedDevice, listVideos } from './adb.js';
import { startMirror, stopMirror, getMirrorStatus, cleanupOnQuit } from './scrcpy.js';
import { selectFolder, getFilesystemType } from './filesystem.js';
import { getDestination, setDestination } from './store.js';
import type { DeviceStatus, MirrorStatus, VideoFile, DestinationInfo } from '../shared/types.js';

let mainWindow: BrowserWindow | null = null;
let pollingInterval: ReturnType<typeof setInterval> | null = null;
let lastDeviceStatus: DeviceStatus | null = null;

function deviceStatusEquals(a: DeviceStatus | null, b: DeviceStatus): boolean {
  if (a === null) return false;
  if (a.status !== b.status) return false;

  switch (a.status) {
    case 'connected':
      return b.status === 'connected' && a.deviceId === b.deviceId && a.deviceName === b.deviceName;
    case 'unauthorized':
      return b.status === 'unauthorized' && a.deviceId === b.deviceId;
    case 'error':
      return b.status === 'error' && a.message === b.message;
    default:
      return true;
  }
}

function startDevicePolling(): void {
  if (pollingInterval) return;

  pollingInterval = setInterval(async () => {
    const status = await getConnectedDevice();
    if (!deviceStatusEquals(lastDeviceStatus, status)) {
      lastDeviceStatus = status;
      mainWindow?.webContents.send('device:status-changed', status);
    }
  }, 2000);
}

function stopDevicePolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

function sendMirrorStatusChange(status: MirrorStatus): void {
  mainWindow?.webContents.send('mirror:status-changed', status);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'VideoFlux',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopDevicePolling();
  });

  startDevicePolling();
}

ipcMain.handle('device:status', async (): Promise<DeviceStatus> => {
  const status = await getConnectedDevice();
  lastDeviceStatus = status;
  return status;
});

ipcMain.handle('mirror:start', async (): Promise<MirrorStatus> => {
  const status = await startMirror(() => {
    sendMirrorStatusChange({ status: 'inactive' });
  });
  sendMirrorStatusChange(status);
  return status;
});

ipcMain.handle('mirror:stop', (): void => {
  stopMirror();
  sendMirrorStatusChange({ status: 'inactive' });
});

ipcMain.handle('mirror:status', (): MirrorStatus => {
  return getMirrorStatus();
});

ipcMain.handle('videos:list', async (): Promise<VideoFile[]> => {
  return listVideos();
});

ipcMain.handle('destination:select', async (): Promise<DestinationInfo | null> => {
  const folderPath = await selectFolder();
  if (!folderPath) {
    return null;
  }

  const filesystem = await getFilesystemType(folderPath);
  const destinationInfo: DestinationInfo = {
    path: folderPath,
    filesystem,
  };

  await setDestination(destinationInfo);
  return destinationInfo;
});

ipcMain.handle('destination:get', async (): Promise<DestinationInfo | null> => {
  return getDestination();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopDevicePolling();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopDevicePolling();
  cleanupOnQuit();
});
