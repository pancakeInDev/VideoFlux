import { useEffect, useState } from 'react';
import type { DestinationInfo, FilesystemInfo } from '../../shared/types';

interface DestinationPickerProps {
  destinationInfo: DestinationInfo | null;
  onDestinationChange: (info: DestinationInfo | null) => void;
}

function getBadgeClasses(fsType: FilesystemInfo['type']): string {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold';
  switch (fsType) {
    case 'FAT32':
      return `${baseClasses} bg-amber-100 text-amber-800`;
    case 'exFAT':
    case 'APFS':
    case 'HFS+':
      return `${baseClasses} bg-emerald-100 text-emerald-800`;
    case 'NTFS':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-600`;
  }
}

function formatFsType(fsType: FilesystemInfo['type']): string {
  switch (fsType) {
    case 'FAT32':
      return 'FAT32';
    case 'exFAT':
      return 'exFAT';
    case 'APFS':
      return 'APFS';
    case 'HFS+':
      return 'HFS+';
    case 'NTFS':
      return 'NTFS';
    default:
      return 'Unknown';
  }
}

export default function DestinationPicker({ destinationInfo, onDestinationChange }: DestinationPickerProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    window.videoFlux.getDestination().then(onDestinationChange);
  }, [onDestinationChange]);

  const handleSelectFolder = async () => {
    setIsSelecting(true);
    try {
      const result = await window.videoFlux.selectDestination();
      if (result) {
        onDestinationChange(result);
      }
    } finally {
      setIsSelecting(false);
    }
  };

  const isFat32 = destinationInfo?.filesystem.type === 'FAT32';

  return (
    <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[700px] flex flex-col gap-3">
      <div className="flex justify-between items-center gap-3">
        <p className="text-base font-semibold text-apple-text-primary m-0">Destination Folder</p>
        <button
          className="bg-apple-blue text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          onClick={handleSelectFolder}
          disabled={isSelecting}
        >
          {isSelecting ? 'Selecting...' : 'Select Folder'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {destinationInfo ? (
          <>
            <div className="text-sm text-apple-text-primary break-all bg-apple-bg-secondary px-3 py-2.5 rounded-lg">
              {destinationInfo.path}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={getBadgeClasses(destinationInfo.filesystem.type)}>
                {formatFsType(destinationInfo.filesystem.type)}
              </span>
              <span className="text-xs text-apple-text-secondary">
                {destinationInfo.filesystem.volumeName}
              </span>
            </div>
            {isFat32 && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 rounded-lg text-xs text-amber-800">
                <span className="text-base font-bold">!</span>
                <span>FAT32 has a 4GB file size limit. Large videos may fail to transfer.</span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-apple-text-secondary m-0 text-center py-4">No destination selected</p>
        )}
      </div>
    </div>
  );
}
