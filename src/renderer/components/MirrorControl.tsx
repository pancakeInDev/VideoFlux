import { useEffect, useState } from 'react';
import type { DeviceStatus as DeviceStatusType, MirrorStatus as MirrorStatusType } from '../../shared/types';

interface MirrorControlProps {
  deviceStatus: DeviceStatusType | null;
}

function StatusIndicator({ color }: { color: 'gray' | 'green' | 'yellow' | 'red' }) {
  const colorClasses = {
    gray: 'bg-gray-400',
    green: 'bg-apple-green',
    yellow: 'bg-apple-yellow',
    red: 'bg-apple-red',
  };
  return <div className={`w-3 h-3 rounded-full shrink-0 ${colorClasses[color]}`} />;
}

export default function MirrorControl({ deviceStatus }: MirrorControlProps) {
  const [mirrorStatus, setMirrorStatus] = useState<MirrorStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.videoFlux.getMirrorStatus().then(setMirrorStatus);

    const unsubscribe = window.videoFlux.onMirrorStatusChange(setMirrorStatus);
    return unsubscribe;
  }, []);

  const isDeviceConnected = deviceStatus?.status === 'connected';
  const isMirrorActive = mirrorStatus?.status === 'active';
  const canStartMirror = isDeviceConnected && !isMirrorActive && !isLoading;

  const handleStartMirror = async () => {
    setIsLoading(true);
    try {
      await window.videoFlux.startMirror();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopMirror = async () => {
    await window.videoFlux.stopMirror();
  };

  const getStatusIndicatorColor = (): 'gray' | 'green' | 'yellow' | 'red' => {
    if (!mirrorStatus || mirrorStatus.status === 'inactive') return 'gray';
    if (mirrorStatus.status === 'active') return 'green';
    if (mirrorStatus.status === 'starting') return 'yellow';
    return 'red';
  };

  const getStatusText = (): string => {
    if (!mirrorStatus || mirrorStatus.status === 'inactive') return 'Mirroring Inactive';
    if (mirrorStatus.status === 'active') return 'Mirroring Active';
    if (mirrorStatus.status === 'starting') return 'Starting...';
    if (mirrorStatus.status === 'scrcpy-not-installed') return 'scrcpy Not Installed';
    if (mirrorStatus.status === 'error') return 'Error';
    return 'Unknown';
  };

  return (
    <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <StatusIndicator color={getStatusIndicatorColor()} />
        <p className="text-base font-semibold text-apple-text-primary m-0">{getStatusText()}</p>
      </div>

      {mirrorStatus?.status === 'scrcpy-not-installed' && (
        <p className="text-sm text-apple-red m-0">
          scrcpy is not installed. Install it with:{' '}
          <code className="font-mono bg-apple-bg-secondary px-1.5 py-0.5 rounded text-xs">brew install scrcpy</code>
        </p>
      )}

      {mirrorStatus?.status === 'error' && (
        <p className="text-sm text-apple-red m-0">
          Failed to start screen mirroring. Make sure your device is connected and authorized.
        </p>
      )}

      {!isDeviceConnected && mirrorStatus?.status !== 'active' && (
        <p className="text-sm text-apple-text-secondary m-0">
          Connect a device to start mirroring
        </p>
      )}

      {isMirrorActive ? (
        <button
          className="bg-apple-red text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-150"
          onClick={handleStopMirror}
        >
          Stop Mirror
        </button>
      ) : (
        <button
          className="bg-apple-blue text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          onClick={handleStartMirror}
          disabled={!canStartMirror}
        >
          {isLoading ? 'Starting...' : 'Start Mirror'}
        </button>
      )}
    </div>
  );
}
