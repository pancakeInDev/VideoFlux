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
        <div className="flex flex-col items-center gap-2 py-6 text-apple-text-secondary">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          <p className="text-sm m-0">Connect a device to browse videos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[700px] flex flex-col gap-3">
      <div className="flex justify-between items-center gap-3">
        <p className="text-base font-semibold text-apple-text-primary m-0">Videos</p>
        <div className="flex gap-2">
          <button
            className="bg-apple-bg-secondary text-apple-text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2"
            onClick={handleSelectAll}
            disabled={isLoading || videos.length === 0}
          >
            Select All
          </button>
          <button
            className="bg-apple-bg-secondary text-apple-text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2"
            onClick={handleDeselectAll}
            disabled={isLoading || selectedPaths.size === 0}
          >
            Deselect All
          </button>
          <button
            className="bg-apple-blue text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-all duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2"
            onClick={fetchVideos}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            className="bg-apple-red text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-all duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-red focus-visible:ring-offset-2"
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
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${deleteResult.failed > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className={`text-xs m-0 ${deleteResult.failed > 0 ? 'text-apple-red' : 'text-apple-green'}`}>
            {deleteResult.deleted > 0 && `Deleted ${deleteResult.deleted} video${deleteResult.deleted !== 1 ? 's' : ''}`}
            {deleteResult.deleted > 0 && deleteResult.failed > 0 && ', '}
            {deleteResult.failed > 0 && `${deleteResult.failed} failed`}
          </p>
          <button
            className="text-apple-text-secondary hover:text-apple-text-primary transition-colors duration-150 p-1"
            onClick={() => setDeleteResult(null)}
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="max-h-[300px] overflow-y-auto rounded-lg bg-apple-bg-secondary">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-8 text-apple-text-secondary">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm m-0">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-apple-text-secondary">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <p className="text-sm m-0">No videos found in DCIM/Camera</p>
          </div>
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
