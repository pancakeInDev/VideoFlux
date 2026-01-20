import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { getConnectedDevice, listVideos, getFileSize, transferFile } from './adb.js';
import { startMirror, stopMirror, getMirrorStatus, cleanupOnQuit } from './scrcpy.js';
import { selectFolder, getFilesystemType } from './filesystem.js';
import { getDestination, setDestination } from './store.js';
import type { DeviceStatus, MirrorStatus, VideoFile, DestinationInfo, TransferProgress, LargeFileWarning } from '../shared/types.js';

const FAT32_MAX_FILE_SIZE = 4294967295;

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

interface TransferState {
  isTransferring: boolean;
  cancelRequested: boolean;
  pendingFiles: string[];
  destPath: string;
  filesystemType: string;
}

const transferState: TransferState = {
  isTransferring: false,
  cancelRequested: false,
  pendingFiles: [],
  destPath: '',
  filesystemType: '',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function sendTransferProgress(progress: TransferProgress): void {
  mainWindow?.webContents.send('transfer:progress', progress);
}

async function executeTransfer(files: string[], destPath: string): Promise<void> {
  transferState.isTransferring = true;
  transferState.cancelRequested = false;

  const completedFiles: string[] = [];
  const failedFiles: Array<{ path: string; error: string }> = [];

  for (let i = 0; i < files.length; i++) {
    if (transferState.cancelRequested) {
      sendTransferProgress({
        status: 'cancelled',
        currentFileIndex: i,
        totalFiles: files.length,
        completedFiles,
        failedFiles,
      });
      transferState.isTransferring = false;
      return;
    }

    const filePath = files[i];
    const filename = path.basename(filePath);

    sendTransferProgress({
      status: 'transferring',
      currentFile: filename,
      currentFileIndex: i,
      totalFiles: files.length,
      fileProgress: 0,
      completedFiles,
      failedFiles,
    });

    const result = await transferFile(filePath, destPath, (percent) => {
      sendTransferProgress({
        status: 'transferring',
        currentFile: filename,
        currentFileIndex: i,
        totalFiles: files.length,
        fileProgress: percent,
        completedFiles,
        failedFiles,
      });
    });

    if (result.success) {
      completedFiles.push(filename);
    } else {
      failedFiles.push({ path: filePath, error: result.error || 'Unknown error' });
    }
  }

  sendTransferProgress({
    status: 'complete',
    totalFiles: files.length,
    completedFiles,
    failedFiles,
  });

  transferState.isTransferring = false;
}

interface TransferStartParams {
  files: string[];
  destPath: string;
  filesystemType: string;
}

interface TransferStartResult {
  needsWarning: boolean;
  largeFiles?: LargeFileWarning;
  started?: boolean;
}

ipcMain.handle('transfer:start', async (_, params: TransferStartParams): Promise<TransferStartResult> => {
  const { files, destPath, filesystemType } = params;

  if (transferState.isTransferring) {
    return { needsWarning: false, started: false };
  }

  sendTransferProgress({ status: 'checking' });

  if (filesystemType === 'FAT32') {
    const largeFiles: Array<{ path: string; filename: string; size: number; sizeHuman: string }> = [];

    for (const filePath of files) {
      const size = await getFileSize(filePath);
      if (size > FAT32_MAX_FILE_SIZE) {
        largeFiles.push({
          path: filePath,
          filename: path.basename(filePath),
          size,
          sizeHuman: formatBytes(size),
        });
      }
    }

    if (largeFiles.length > 0) {
      transferState.pendingFiles = files.filter(
        f => !largeFiles.some(lf => lf.path === f)
      );
      transferState.destPath = destPath;
      transferState.filesystemType = filesystemType;

      sendTransferProgress({ status: 'idle' });

      return {
        needsWarning: true,
        largeFiles: {
          files: largeFiles,
          filesystemType,
        },
      };
    }
  }

  executeTransfer(files, destPath);
  return { needsWarning: false, started: true };
});

ipcMain.handle('transfer:confirm', async (): Promise<boolean> => {
  if (transferState.isTransferring || transferState.pendingFiles.length === 0) {
    return false;
  }

  executeTransfer(transferState.pendingFiles, transferState.destPath);
  transferState.pendingFiles = [];
  return true;
});

ipcMain.handle('transfer:cancel', (): void => {
  if (transferState.isTransferring) {
    transferState.cancelRequested = true;
  }
  transferState.pendingFiles = [];
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
