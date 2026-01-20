import { useEffect, useState, useCallback } from 'react';
import DeviceStatus from './components/DeviceStatus';
import MirrorControl from './components/MirrorControl';
import VideoList from './components/VideoList';
import DestinationPicker from './components/DestinationPicker';
import type { DeviceStatus as DeviceStatusType, DestinationInfo } from '../shared/types';

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

  useEffect(() => {
    window.videoFlux.getDeviceStatus().then(setDeviceStatus);

    const unsubscribe = window.videoFlux.onDeviceStatusChange(setDeviceStatus);
    return unsubscribe;
  }, []);

  const handleSelectionChange = useCallback((paths: string[]) => {
    setSelectedVideoPaths(paths);
  }, []);

  const handleDestinationChange = useCallback((info: DestinationInfo | null) => {
    setDestinationInfo(info);
  }, []);

  console.log('Selected videos:', selectedVideoPaths.length);
  console.log('Destination:', destinationInfo?.path);

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>VideoFlux</h1>
      <DeviceStatus />
      <MirrorControl deviceStatus={deviceStatus} />
      <VideoList deviceStatus={deviceStatus} onSelectionChange={handleSelectionChange} />
      <DestinationPicker destinationInfo={destinationInfo} onDestinationChange={handleDestinationChange} />
    </div>
  );
}
