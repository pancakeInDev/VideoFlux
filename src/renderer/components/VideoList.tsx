import { useEffect, useState, useCallback } from 'react';
import type { DeviceStatus as DeviceStatusType, VideoFile } from '../../shared/types';

interface VideoListProps {
  deviceStatus: DeviceStatusType | null;
  onSelectionChange: (selectedPaths: string[]) => void;
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

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  fontSize: '0.8rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: '6px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: disabled ? '#4a4a6a' : '#6366f1',
  color: disabled ? '#9ca3af' : '#ffffff',
  transition: 'background-color 0.2s',
});

const secondaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
  ...buttonStyle(disabled),
  backgroundColor: disabled ? '#4a4a6a' : '#374151',
});

const dangerButtonStyle = (disabled: boolean): React.CSSProperties => ({
  ...buttonStyle(disabled),
  backgroundColor: disabled ? '#4a4a6a' : '#dc2626',
});

const tableContainerStyle: React.CSSProperties = {
  maxHeight: '300px',
  overflowY: 'auto',
  borderRadius: '8px',
  backgroundColor: '#1a1a2e',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem',
};

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  borderBottom: '1px solid #374151',
  color: '#9ca3af',
  fontWeight: 500,
  position: 'sticky',
  top: 0,
  backgroundColor: '#1a1a2e',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #374151',
  color: '#eaeaea',
};

const checkboxCellStyle: React.CSSProperties = {
  ...tdStyle,
  width: '40px',
  textAlign: 'center',
};

const checkboxStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 16px',
  color: '#9ca3af',
  fontSize: '0.875rem',
};

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 16px',
  color: '#9ca3af',
  fontSize: '0.875rem',
};

const disabledMessageStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#9ca3af',
  margin: 0,
  textAlign: 'center',
  padding: '16px',
};

const countStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#9ca3af',
  margin: 0,
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function VideoList({ deviceStatus, onSelectionChange }: VideoListProps) {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ deleted: number; failed: number } | null>(null);

  const isDeviceConnected = deviceStatus?.status === 'connected';

  const fetchVideos = useCallback(async () => {
    if (!isDeviceConnected) return;

    setIsLoading(true);
    try {
      const videoList = await window.videoFlux.listVideos();
      const parsedVideos = videoList.map(v => ({
        ...v,
        modified: new Date(v.modified),
      }));
      setVideos(parsedVideos);
      setSelectedPaths(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [isDeviceConnected]);

  useEffect(() => {
    if (isDeviceConnected) {
      fetchVideos();
    } else {
      setVideos([]);
      setSelectedPaths(new Set());
    }
  }, [isDeviceConnected, fetchVideos]);

  useEffect(() => {
    onSelectionChange(Array.from(selectedPaths));
  }, [selectedPaths, onSelectionChange]);

  const handleToggleSelection = (path: string) => {
    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedPaths(new Set(videos.map(v => v.path)));
  };

  const handleDeselectAll = () => {
    setSelectedPaths(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedPaths.size === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedPaths.size} video${selectedPaths.size !== 1 ? 's' : ''} from your phone? This cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    setDeleteResult(null);

    try {
      const result = await window.videoFlux.deleteVideos(Array.from(selectedPaths));
      setDeleteResult({ deleted: result.deleted.length, failed: result.failed.length });
      setSelectedPaths(new Set());
      await fetchVideos();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isDeviceConnected) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={titleStyle}>Videos</p>
        </div>
        <p style={disabledMessageStyle}>Connect a device to browse videos</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={titleStyle}>Videos</p>
        <div style={buttonGroupStyle}>
          <button
            style={secondaryButtonStyle(isLoading || videos.length === 0)}
            onClick={handleSelectAll}
            disabled={isLoading || videos.length === 0}
          >
            Select All
          </button>
          <button
            style={secondaryButtonStyle(isLoading || selectedPaths.size === 0)}
            onClick={handleDeselectAll}
            disabled={isLoading || selectedPaths.size === 0}
          >
            Deselect All
          </button>
          <button
            style={buttonStyle(isLoading)}
            onClick={fetchVideos}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            style={dangerButtonStyle(isLoading || isDeleting || selectedPaths.size === 0)}
            onClick={handleDeleteSelected}
            disabled={isLoading || isDeleting || selectedPaths.size === 0}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {selectedPaths.size > 0 && (
        <p style={countStyle}>{selectedPaths.size} video{selectedPaths.size !== 1 ? 's' : ''} selected</p>
      )}

      {deleteResult && (
        <p style={{ ...countStyle, color: deleteResult.failed > 0 ? '#f87171' : '#4ade80' }}>
          {deleteResult.deleted > 0 && `Deleted ${deleteResult.deleted} video${deleteResult.deleted !== 1 ? 's' : ''}`}
          {deleteResult.deleted > 0 && deleteResult.failed > 0 && ', '}
          {deleteResult.failed > 0 && `${deleteResult.failed} failed`}
        </p>
      )}

      <div style={tableContainerStyle}>
        {isLoading ? (
          <p style={loadingStyle}>Loading videos...</p>
        ) : videos.length === 0 ? (
          <p style={emptyStateStyle}>No videos found in DCIM/Camera</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}></th>
                <th style={thStyle}>Filename</th>
                <th style={{ ...thStyle, width: '80px' }}>Size</th>
                <th style={{ ...thStyle, width: '150px' }}>Modified</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(video => (
                <tr key={video.path}>
                  <td style={checkboxCellStyle}>
                    <input
                      type="checkbox"
                      style={checkboxStyle}
                      checked={selectedPaths.has(video.path)}
                      onChange={() => handleToggleSelection(video.path)}
                    />
                  </td>
                  <td style={tdStyle}>{video.filename}</td>
                  <td style={tdStyle}>{video.sizeHuman}</td>
                  <td style={tdStyle}>{formatDate(video.modified)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
