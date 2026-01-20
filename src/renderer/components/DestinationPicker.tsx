import { useEffect, useState } from 'react';
import type { DestinationInfo, FilesystemInfo } from '../../shared/types';

interface DestinationPickerProps {
  destinationInfo: DestinationInfo | null;
  onDestinationChange: (info: DestinationInfo | null) => void;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px 24px',
  backgroundColor: '#252540',
  borderRadius: '12px',
  marginTop: '16px',
  maxWidth: '700px',
  width: '100%',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  margin: 0,
  color: '#eaeaea',
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '0.8rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  backgroundColor: '#6366f1',
  color: '#ffffff',
  transition: 'background-color 0.2s',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const pathDisplayStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#eaeaea',
  wordBreak: 'break-all',
  backgroundColor: '#1a1a2e',
  padding: '10px 12px',
  borderRadius: '8px',
};

const noDestinationStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#9ca3af',
  textAlign: 'center',
  padding: '16px',
  margin: 0,
};

const badgeContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '4px',
};

const baseBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '16px',
  fontSize: '0.75rem',
  fontWeight: 600,
};

function getBadgeStyle(fsType: FilesystemInfo['type']): React.CSSProperties {
  switch (fsType) {
    case 'FAT32':
      return {
        ...baseBadgeStyle,
        backgroundColor: '#fef3c7',
        color: '#92400e',
      };
    case 'exFAT':
    case 'APFS':
    case 'HFS+':
      return {
        ...baseBadgeStyle,
        backgroundColor: '#d1fae5',
        color: '#065f46',
      };
    case 'NTFS':
      return {
        ...baseBadgeStyle,
        backgroundColor: '#dbeafe',
        color: '#1e40af',
      };
    default:
      return {
        ...baseBadgeStyle,
        backgroundColor: '#e5e7eb',
        color: '#4b5563',
      };
  }
}

const warningStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 12px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  fontSize: '0.8rem',
  color: '#92400e',
};

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
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={titleStyle}>Destination Folder</p>
        <button
          style={buttonStyle}
          onClick={handleSelectFolder}
          disabled={isSelecting}
        >
          {isSelecting ? 'Selecting...' : 'Select Folder'}
        </button>
      </div>

      <div style={contentStyle}>
        {destinationInfo ? (
          <>
            <div style={pathDisplayStyle}>{destinationInfo.path}</div>
            <div style={badgeContainerStyle}>
              <span style={getBadgeStyle(destinationInfo.filesystem.type)}>
                {formatFsType(destinationInfo.filesystem.type)}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {destinationInfo.filesystem.volumeName}
              </span>
            </div>
            {isFat32 && (
              <div style={warningStyle}>
                <span style={{ fontSize: '1rem' }}>!</span>
                <span>FAT32 has a 4GB file size limit. Large videos may fail to transfer.</span>
              </div>
            )}
          </>
        ) : (
          <p style={noDestinationStyle}>No destination selected</p>
        )}
      </div>
    </div>
  );
}
