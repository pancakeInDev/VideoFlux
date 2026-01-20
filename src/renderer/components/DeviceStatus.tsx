import { useEffect, useState } from 'react';
import type { DeviceStatus as DeviceStatusType } from '../../shared/types';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 24px',
  backgroundColor: '#252540',
  borderRadius: '12px',
  marginTop: '24px',
  maxWidth: '500px',
};

const indicatorStyle = (color: string): React.CSSProperties => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: color,
  flexShrink: 0,
});

const textContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  margin: 0,
  color: '#eaeaea',
};

const detailsStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#9ca3af',
  margin: 0,
  whiteSpace: 'pre-line',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  backgroundColor: '#1a1a2e',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.8rem',
};

export default function DeviceStatus() {
  const [status, setStatus] = useState<DeviceStatusType | null>(null);

  useEffect(() => {
    window.videoFlux.getDeviceStatus().then(setStatus);

    const unsubscribe = window.videoFlux.onDeviceStatusChange(setStatus);
    return unsubscribe;
  }, []);

  if (!status) {
    return (
      <div style={containerStyle}>
        <div style={indicatorStyle('#6b7280')} />
        <div style={textContainerStyle}>
          <p style={titleStyle}>Checking device status...</p>
        </div>
      </div>
    );
  }

  switch (status.status) {
    case 'connected':
      return (
        <div style={containerStyle}>
          <div style={indicatorStyle('#22c55e')} />
          <div style={textContainerStyle}>
            <p style={titleStyle}>{status.deviceName}</p>
            <p style={detailsStyle}>Device ID: {status.deviceId}</p>
          </div>
        </div>
      );

    case 'unauthorized':
      return (
        <div style={containerStyle}>
          <div style={indicatorStyle('#eab308')} />
          <div style={textContainerStyle}>
            <p style={titleStyle}>Unauthorized Device</p>
            <p style={detailsStyle}>
              Device detected but not authorized. On your phone:{'\n'}
              1. Look for the &quot;Allow USB debugging&quot; popup{'\n'}
              2. Check &quot;Always allow from this computer&quot;{'\n'}
              3. Tap &quot;Allow&quot;
            </p>
          </div>
        </div>
      );

    case 'no-device':
      return (
        <div style={containerStyle}>
          <div style={indicatorStyle('#ef4444')} />
          <div style={textContainerStyle}>
            <p style={titleStyle}>No Device Detected</p>
            <p style={detailsStyle}>
              No Android device detected. Make sure:{'\n'}
              {'\u2022'} USB cable is connected{'\n'}
              {'\u2022'} USB debugging is enabled on your phone{'\n'}
              {'\u2022'} You&apos;ve selected &quot;File Transfer&quot; mode
            </p>
          </div>
        </div>
      );

    case 'adb-not-installed':
      return (
        <div style={containerStyle}>
          <div style={indicatorStyle('#ef4444')} />
          <div style={textContainerStyle}>
            <p style={titleStyle}>ADB Not Installed</p>
            <p style={detailsStyle}>
              ADB is not installed. Install it with:{'\n'}
              <span style={codeStyle}>brew install android-platform-tools</span>
            </p>
          </div>
        </div>
      );

    case 'error':
      return (
        <div style={containerStyle}>
          <div style={indicatorStyle('#ef4444')} />
          <div style={textContainerStyle}>
            <p style={titleStyle}>Error</p>
            <p style={detailsStyle}>{status.message}</p>
          </div>
        </div>
      );
  }
}
