import { useEffect, useState, useCallback } from 'react';
import DeviceStatus from './components/DeviceStatus';
import MirrorControl from './components/MirrorControl';
import VideoList from './components/VideoList';
import DestinationPicker from './components/DestinationPicker';
import TransferProgress from './components/TransferProgress';
import LargeFileWarning from './components/LargeFileWarning';
import type {
  DeviceStatus as DeviceStatusType,
  DestinationInfo,
  TransferProgress as TransferProgressType,
  LargeFileWarning as LargeFileWarningType,
} from '../shared/types';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#1a1a2e',
  color: '#eaeaea',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
};

const headingStyle: React.CSSProperties = {
  fontSize: '3rem',
  fontWeight: 700,
  margin: 0,
};

export default function App() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusType | null>(null);
  const [selectedVideoPaths, setSelectedVideoPaths] = useState<string[]>([]);
  const [destinationInfo, setDestinationInfo] = useState<DestinationInfo | null>(null);
  const [transferProgress, setTransferProgress] = useState<TransferProgressType>({ status: 'idle' });
  const [largeFileWarning, setLargeFileWarning] = useState<LargeFileWarningType | null>(null);

  useEffect(() => {
    window.videoFlux.getDeviceStatus().then(setDeviceStatus);
    const unsubscribe = window.videoFlux.onDeviceStatusChange(setDeviceStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = window.videoFlux.onTransferProgress(setTransferProgress);
    return unsubscribe;
  }, []);

  const handleSelectionChange = useCallback((paths: string[]) => {
    setSelectedVideoPaths(paths);
  }, []);

  const handleDestinationChange = useCallback((info: DestinationInfo | null) => {
    setDestinationInfo(info);
  }, []);

  const canStartTransfer =
    selectedVideoPaths.length > 0 &&
    destinationInfo !== null &&
    transferProgress.status === 'idle';

  const handleStartTransfer = useCallback(async () => {
    if (!canStartTransfer || !destinationInfo) return;

    const result = await window.videoFlux.startTransfer(
      selectedVideoPaths,
      destinationInfo.path,
      destinationInfo.filesystem.type
    );

    if (result.needsWarning && result.largeFiles) {
      setLargeFileWarning(result.largeFiles);
    }
  }, [canStartTransfer, selectedVideoPaths, destinationInfo]);

  const handleConfirmTransfer = useCallback(async () => {
    setLargeFileWarning(null);
    await window.videoFlux.confirmTransfer();
  }, []);

  const handleCancelWarning = useCallback(() => {
    setLargeFileWarning(null);
    window.videoFlux.cancelTransfer();
  }, []);

  const handleCancelTransfer = useCallback(() => {
    window.videoFlux.cancelTransfer();
  }, []);

  const handleDismissTransfer = useCallback(() => {
    setTransferProgress({ status: 'idle' });
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>VideoFlux</h1>
      <DeviceStatus />
      <MirrorControl deviceStatus={deviceStatus} />
      <VideoList deviceStatus={deviceStatus} onSelectionChange={handleSelectionChange} />
      <DestinationPicker destinationInfo={destinationInfo} onDestinationChange={handleDestinationChange} />
      <TransferProgress
        progress={transferProgress}
        onCancel={handleCancelTransfer}
        onDismiss={handleDismissTransfer}
        onStartTransfer={handleStartTransfer}
        canStartTransfer={canStartTransfer}
      />
      {largeFileWarning && (
        <LargeFileWarning
          warning={largeFileWarning}
          onProceed={handleConfirmTransfer}
          onCancel={handleCancelWarning}
        />
      )}
    </div>
  );
}
