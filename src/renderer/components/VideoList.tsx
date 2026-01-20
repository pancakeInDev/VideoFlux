import { useEffect, useState, useCallback } from 'react';
import type { DeviceStatus as DeviceStatusType, VideoFile } from '../../shared/types';

interface VideoListProps {
  deviceStatus: DeviceStatusType | null;
  onSelectionChange: (selectedPaths: string[]) => void;
}

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
      <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[700px] flex flex-col gap-3">
        <div className="flex justify-between items-center gap-3">
          <p className="text-base font-semibold text-apple-text-primary m-0">Videos</p>
        </div>
        <p className="text-sm text-apple-text-secondary m-0 text-center py-4">Connect a device to browse videos</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[700px] flex flex-col gap-3">
      <div className="flex justify-between items-center gap-3">
        <p className="text-base font-semibold text-apple-text-primary m-0">Videos</p>
        <div className="flex gap-2">
          <button
            className="bg-apple-bg-secondary text-apple-text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handleSelectAll}
            disabled={isLoading || videos.length === 0}
          >
            Select All
          </button>
          <button
            className="bg-apple-bg-secondary text-apple-text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handleDeselectAll}
            disabled={isLoading || selectedPaths.size === 0}
          >
            Deselect All
          </button>
          <button
            className="bg-apple-blue text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={fetchVideos}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            className="bg-apple-red text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handleDeleteSelected}
            disabled={isLoading || isDeleting || selectedPaths.size === 0}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {selectedPaths.size > 0 && (
        <p className="text-xs text-apple-text-secondary m-0">{selectedPaths.size} video{selectedPaths.size !== 1 ? 's' : ''} selected</p>
      )}

      {deleteResult && (
        <p className={`text-xs m-0 ${deleteResult.failed > 0 ? 'text-apple-red' : 'text-apple-green'}`}>
          {deleteResult.deleted > 0 && `Deleted ${deleteResult.deleted} video${deleteResult.deleted !== 1 ? 's' : ''}`}
          {deleteResult.deleted > 0 && deleteResult.failed > 0 && ', '}
          {deleteResult.failed > 0 && `${deleteResult.failed} failed`}
        </p>
      )}

      <div className="max-h-[300px] overflow-y-auto rounded-lg bg-apple-bg-secondary">
        {isLoading ? (
          <p className="text-center py-8 text-sm text-apple-text-secondary">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-center py-8 text-sm text-apple-text-secondary">No videos found in DCIM/Camera</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="py-2.5 px-3 text-left border-b border-apple-border text-apple-text-secondary font-medium sticky top-0 bg-apple-bg-secondary w-10 text-center"></th>
                <th className="py-2.5 px-3 text-left border-b border-apple-border text-apple-text-secondary font-medium sticky top-0 bg-apple-bg-secondary">Filename</th>
                <th className="py-2.5 px-3 text-left border-b border-apple-border text-apple-text-secondary font-medium sticky top-0 bg-apple-bg-secondary w-20">Size</th>
                <th className="py-2.5 px-3 text-left border-b border-apple-border text-apple-text-secondary font-medium sticky top-0 bg-apple-bg-secondary w-[150px]">Modified</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(video => (
                <tr key={video.path} className="hover:bg-gray-100">
                  <td className="py-2.5 px-3 border-b border-apple-border text-apple-text-primary w-10 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer accent-apple-blue"
                      checked={selectedPaths.has(video.path)}
                      onChange={() => handleToggleSelection(video.path)}
                    />
                  </td>
                  <td className="py-2.5 px-3 border-b border-apple-border text-apple-text-primary">{video.filename}</td>
                  <td className="py-2.5 px-3 border-b border-apple-border text-apple-text-primary">{video.sizeHuman}</td>
                  <td className="py-2.5 px-3 border-b border-apple-border text-apple-text-primary">{formatDate(video.modified)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
