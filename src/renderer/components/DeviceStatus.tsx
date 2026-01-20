import { useEffect, useState } from 'react';
import type { DeviceStatus as DeviceStatusType } from '../../shared/types';

function StatusIndicator({ color }: { color: 'gray' | 'green' | 'yellow' | 'red' }) {
  const colorClasses = {
    gray: 'bg-gray-400',
    green: 'bg-apple-green',
    yellow: 'bg-apple-yellow',
    red: 'bg-apple-red',
  };
  return <div className={`w-3 h-3 rounded-full shrink-0 ${colorClasses[color]}`} />;
}

export default function DeviceStatus() {
  const [status, setStatus] = useState<DeviceStatusType | null>(null);

  useEffect(() => {
    window.videoFlux.getDeviceStatus().then(setStatus);

    const unsubscribe = window.videoFlux.onDeviceStatusChange(setStatus);
    return unsubscribe;
  }, []);

  if (!status) {
    return (
      <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex items-center gap-3">
        <StatusIndicator color="gray" />
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-apple-text-primary m-0">Checking device status...</p>
        </div>
      </div>
    );
  }

  switch (status.status) {
    case 'connected':
      return (
        <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex items-center gap-3">
          <StatusIndicator color="green" />
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-apple-text-primary m-0">{status.deviceName}</p>
            <p className="text-sm text-apple-text-secondary m-0">Device ID: {status.deviceId}</p>
          </div>
        </div>
      );

    case 'unauthorized':
      return (
        <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex items-center gap-3">
          <StatusIndicator color="yellow" />
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-apple-text-primary m-0">Unauthorized Device</p>
            <p className="text-sm text-apple-text-secondary m-0 whitespace-pre-line">
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
        <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex items-center gap-3">
          <StatusIndicator color="red" />
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-apple-text-primary m-0">No Device Detected</p>
            <p className="text-sm text-apple-text-secondary m-0 whitespace-pre-line">
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
        <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex items-center gap-3">
          <StatusIndicator color="red" />
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-apple-text-primary m-0">ADB Not Installed</p>
            <p className="text-sm text-apple-text-secondary m-0">
              ADB is not installed. Install it with:{'\n'}
              <code className="font-mono bg-apple-bg-secondary px-1.5 py-0.5 rounded text-xs">brew install android-platform-tools</code>
            </p>
          </div>
        </div>
      );

    case 'error':
      return (
        <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex items-center gap-3">
          <StatusIndicator color="red" />
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-apple-text-primary m-0">Error</p>
            <p className="text-sm text-apple-text-secondary m-0">{status.message}</p>
          </div>
        </div>
      );
  }
}
