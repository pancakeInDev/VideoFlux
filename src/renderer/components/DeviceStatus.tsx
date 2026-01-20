import { useEffect, useState } from 'react';
import type { DeviceStatus as DeviceStatusType } from '../../shared/types';

function StatusIndicator({ color, pulse }: { color: 'gray' | 'green' | 'yellow' | 'red'; pulse?: boolean }) {
  const colorClasses = {
    gray: 'bg-gray-400',
    green: 'bg-apple-green',
    yellow: 'bg-apple-yellow',
    red: 'bg-apple-red',
  };
  return <div className={`w-3 h-3 rounded-full shrink-0 ${colorClasses[color]} ${pulse ? 'animate-pulse-slow' : ''}`} />;
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
        <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-apple-lg transition-all duration-200">
          <StatusIndicator color="green" pulse />
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
        <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <StatusIndicator color="red" />
            <p className="text-base font-semibold text-apple-text-primary m-0">No Device Detected</p>
          </div>
          <div className="flex items-start gap-3 bg-apple-bg-secondary rounded-lg p-4">
            <svg className="w-8 h-8 text-apple-text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
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
        <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[500px] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <StatusIndicator color="red" />
            <p className="text-base font-semibold text-apple-text-primary m-0">ADB Not Installed</p>
          </div>
          <div className="bg-apple-bg-secondary rounded-lg p-4">
            <p className="text-sm text-apple-text-secondary m-0 mb-2">
              ADB is required to connect to your Android device. Install it by running:
            </p>
            <code className="font-mono bg-white px-3 py-2 rounded-md text-sm block border border-apple-border">
              brew install android-platform-tools
            </code>
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
