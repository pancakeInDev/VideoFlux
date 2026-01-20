import { useEffect, useState } from 'react';
import type { DeviceStatus as DeviceStatusType, MirrorStatus as MirrorStatusType } from '../../shared/types';

interface MirrorControlProps {
  deviceStatus: DeviceStatusType | null;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px 24px',
  backgroundColor: '#252540',
  borderRadius: '12px',
  marginTop: '16px',
  maxWidth: '500px',
  width: '100%',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const indicatorStyle = (color: string): React.CSSProperties => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: color,
  flexShrink: 0,
});

const titleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  margin: 0,
  color: '#eaeaea',
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  fontSize: '0.9rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: '8px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: disabled ? '#4a4a6a' : '#6366f1',
  color: disabled ? '#9ca3af' : '#ffffff',
  transition: 'background-color 0.2s',
});

const stopButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '0.9rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  backgroundColor: '#ef4444',
  color: '#ffffff',
  transition: 'background-color 0.2s',
};

const errorStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#ef4444',
  margin: 0,
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  backgroundColor: '#1a1a2e',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.8rem',
};

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

  const getStatusIndicatorColor = (): string => {
    if (!mirrorStatus || mirrorStatus.status === 'inactive') return '#6b7280';
    if (mirrorStatus.status === 'active') return '#22c55e';
    if (mirrorStatus.status === 'starting') return '#eab308';
    return '#ef4444';
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
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={indicatorStyle(getStatusIndicatorColor())} />
        <p style={titleStyle}>{getStatusText()}</p>
      </div>

      {mirrorStatus?.status === 'scrcpy-not-installed' && (
        <p style={errorStyle}>
          scrcpy is not installed. Install it with:{' '}
          <span style={codeStyle}>brew install scrcpy</span>
        </p>
      )}

      {mirrorStatus?.status === 'error' && (
        <p style={errorStyle}>
          Failed to start screen mirroring. Make sure your device is connected and authorized.
        </p>
      )}

      {!isDeviceConnected && mirrorStatus?.status !== 'active' && (
        <p style={{ ...errorStyle, color: '#9ca3af' }}>
          Connect a device to start mirroring
        </p>
      )}

      {isMirrorActive ? (
        <button style={stopButtonStyle} onClick={handleStopMirror}>
          Stop Mirror
        </button>
      ) : (
        <button
          style={buttonStyle(!canStartMirror)}
          onClick={handleStartMirror}
          disabled={!canStartMirror}
        >
          {isLoading ? 'Starting...' : 'Start Mirror'}
        </button>
      )}
    </div>
  );
}
