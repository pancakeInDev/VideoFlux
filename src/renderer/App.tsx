import DeviceStatus from './components/DeviceStatus';

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
  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>VideoFlux</h1>
      <DeviceStatus />
    </div>
  );
}
