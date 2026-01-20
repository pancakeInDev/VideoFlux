import { useEffect, useState } from 'react';
import DeviceStatus from './components/DeviceStatus';
import MirrorControl from './components/MirrorControl';
import type { DeviceStatus as DeviceStatusType } from '../shared/types';

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

  useEffect(() => {
    window.videoFlux.getDeviceStatus().then(setDeviceStatus);

    const unsubscribe = window.videoFlux.onDeviceStatusChange(setDeviceStatus);
    return unsubscribe;
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>VideoFlux</h1>
      <DeviceStatus />
      <MirrorControl deviceStatus={deviceStatus} />
    </div>
  );
}
