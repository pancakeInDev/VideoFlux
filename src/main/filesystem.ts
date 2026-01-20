import { dialog } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { FilesystemInfo } from '../shared/types.js';

const execAsync = promisify(exec);

export async function selectFolder(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Destination Folder',
    buttonLabel: 'Select',
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}

export function getVolumeFromPath(filePath: string): string {
  if (filePath.startsWith('/Volumes/')) {
    const parts = filePath.split('/');
    if (parts.length >= 3) {
      return `/Volumes/${parts[2]}`;
    }
  }
  return '/';
}

export async function getFilesystemType(filePath: string): Promise<FilesystemInfo> {
  const volumePath = getVolumeFromPath(filePath);
  const volumeName = volumePath === '/' ? 'Macintosh HD' : volumePath.split('/').pop() || 'Unknown';

  try {
    const { stdout } = await execAsync(`diskutil info "${volumePath}"`);
    const lines = stdout.split('\n');

    let fsType: FilesystemInfo['type'] = 'unknown';

    for (const line of lines) {
      if (line.includes('File System Personality:')) {
        const personality = line.split(':')[1]?.trim().toLowerCase() || '';

        if (personality.includes('fat32') || personality.includes('ms-dos fat32')) {
          fsType = 'FAT32';
        } else if (personality.includes('exfat')) {
          fsType = 'exFAT';
        } else if (personality.includes('apfs')) {
          fsType = 'APFS';
        } else if (personality.includes('hfs') || personality.includes('journaled hfs+')) {
          fsType = 'HFS+';
        } else if (personality.includes('ntfs')) {
          fsType = 'NTFS';
        }
        break;
      }
    }

    const maxFileSize = fsType === 'FAT32' ? 4294967295 : null;

    return {
      type: fsType,
      volumeName,
      maxFileSize,
    };
  } catch {
    return {
      type: 'unknown',
      volumeName,
      maxFileSize: null,
    };
  }
}
