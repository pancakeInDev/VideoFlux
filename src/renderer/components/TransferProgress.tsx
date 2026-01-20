import type { TransferProgress as TransferProgressType } from '../../shared/types';

interface TransferProgressProps {
  progress: TransferProgressType;
  onCancel: () => void;
  onDismiss: () => void;
  onStartTransfer: () => void;
  canStartTransfer: boolean;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px 24px',
  backgroundColor: '#252540',
  borderRadius: '12px',
  marginTop: '16px',
  maxWidth: '700px',
  width: '100%',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  margin: 0,
  color: '#eaeaea',
};

const buttonStyle = (disabled: boolean, variant: 'primary' | 'secondary' | 'danger' = 'primary'): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
  };

  if (disabled) {
    return { ...baseStyle, backgroundColor: '#4a4a6a', color: '#9ca3af' };
  }

  switch (variant) {
    case 'danger':
      return { ...baseStyle, backgroundColor: '#ef4444', color: '#ffffff' };
    case 'secondary':
      return { ...baseStyle, backgroundColor: '#374151', color: '#ffffff' };
    default:
      return { ...baseStyle, backgroundColor: '#6366f1', color: '#ffffff' };
  }
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: '#374151',
  borderRadius: '4px',
  overflow: 'hidden',
};

const progressBarFillStyle = (percent: number): React.CSSProperties => ({
  width: `${percent}%`,
  height: '100%',
  backgroundColor: '#6366f1',
  transition: 'width 0.2s ease-out',
});

const statusTextStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#9ca3af',
  margin: 0,
};

const currentFileStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#eaeaea',
  margin: 0,
  wordBreak: 'break-all',
};

const summaryContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  backgroundColor: '#1a1a2e',
  borderRadius: '8px',
  padding: '12px',
};

const summaryRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.875rem',
};

const successTextStyle: React.CSSProperties = {
  color: '#10b981',
};

const errorTextStyle: React.CSSProperties = {
  color: '#ef4444',
};

const failedFilesContainerStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '10px 12px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  fontSize: '0.8rem',
};

const failedFileItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  padding: '6px 0',
  borderBottom: '1px solid #fecaca',
};

const idleContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '16px',
};

const checkingTextStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#9ca3af',
  textAlign: 'center',
  padding: '16px',
  margin: 0,
};

export default function TransferProgress({
  progress,
  onCancel,
  onDismiss,
  onStartTransfer,
  canStartTransfer,
}: TransferProgressProps) {
  const renderContent = () => {
    switch (progress.status) {
      case 'idle':
        return (
          <div style={idleContainerStyle}>
            <button
              style={buttonStyle(!canStartTransfer)}
              onClick={onStartTransfer}
              disabled={!canStartTransfer}
            >
              Start Transfer
            </button>
            {!canStartTransfer && (
              <p style={{ ...statusTextStyle, marginTop: '8px' }}>
                Select videos and destination to start transfer
              </p>
            )}
          </div>
        );

      case 'checking':
        return <p style={checkingTextStyle}>Checking files...</p>;

      case 'transferring': {
        const { currentFile, currentFileIndex = 0, totalFiles = 0, fileProgress = 0 } = progress;
        const overallProgress = totalFiles > 0
          ? Math.floor(((currentFileIndex + fileProgress / 100) / totalFiles) * 100)
          : 0;

        return (
          <>
            <div>
              <p style={statusTextStyle}>
                Transferring file {currentFileIndex + 1} of {totalFiles}
              </p>
              {currentFile && <p style={currentFileStyle}>{currentFile}</p>}
            </div>
            <div style={progressBarContainerStyle}>
              <div style={progressBarFillStyle(overallProgress)} />
            </div>
            <p style={statusTextStyle}>{overallProgress}% complete</p>
            <button style={buttonStyle(false, 'danger')} onClick={onCancel}>
              Cancel
            </button>
          </>
        );
      }

      case 'complete': {
        const { completedFiles = [], failedFiles = [], totalFiles = 0 } = progress;

        return (
          <>
            <div style={summaryContainerStyle}>
              <p style={{ ...titleStyle, fontSize: '0.9rem' }}>Transfer Complete</p>
              <div style={summaryRowStyle}>
                <span style={{ color: '#9ca3af' }}>Total files:</span>
                <span style={{ color: '#eaeaea' }}>{totalFiles}</span>
              </div>
              <div style={summaryRowStyle}>
                <span style={{ color: '#9ca3af' }}>Successful:</span>
                <span style={successTextStyle}>{completedFiles.length}</span>
              </div>
              {failedFiles.length > 0 && (
                <div style={summaryRowStyle}>
                  <span style={{ color: '#9ca3af' }}>Failed:</span>
                  <span style={errorTextStyle}>{failedFiles.length}</span>
                </div>
              )}
            </div>

            {failedFiles.length > 0 && (
              <div style={failedFilesContainerStyle}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#991b1b' }}>
                  Failed transfers:
                </p>
                {failedFiles.map((file, index) => (
                  <div
                    key={file.path}
                    style={{
                      ...failedFileItemStyle,
                      borderBottom: index === failedFiles.length - 1 ? 'none' : '1px solid #fecaca',
                    }}
                  >
                    <span style={{ color: '#991b1b', fontWeight: 500 }}>
                      {file.path.split('/').pop()}
                    </span>
                    <span style={{ color: '#b91c1c' }}>{file.error}</span>
                  </div>
                ))}
              </div>
            )}

            <button style={buttonStyle(false, 'secondary')} onClick={onDismiss}>
              Dismiss
            </button>
          </>
        );
      }

      case 'cancelled': {
        const { completedFiles = [], failedFiles = [] } = progress;

        return (
          <>
            <div style={summaryContainerStyle}>
              <p style={{ ...titleStyle, fontSize: '0.9rem', color: '#f59e0b' }}>
                Transfer Cancelled
              </p>
              {completedFiles.length > 0 && (
                <div style={summaryRowStyle}>
                  <span style={{ color: '#9ca3af' }}>Files transferred before cancel:</span>
                  <span style={successTextStyle}>{completedFiles.length}</span>
                </div>
              )}
              {failedFiles.length > 0 && (
                <div style={summaryRowStyle}>
                  <span style={{ color: '#9ca3af' }}>Failed:</span>
                  <span style={errorTextStyle}>{failedFiles.length}</span>
                </div>
              )}
            </div>

            <button style={buttonStyle(false, 'secondary')} onClick={onDismiss}>
              Dismiss
            </button>
          </>
        );
      }

      case 'error':
        return (
          <>
            <div style={summaryContainerStyle}>
              <p style={{ ...titleStyle, fontSize: '0.9rem', color: '#ef4444' }}>
                Transfer Error
              </p>
              {progress.errorMessage && (
                <p style={{ ...statusTextStyle, color: '#ef4444' }}>{progress.errorMessage}</p>
              )}
            </div>

            <button style={buttonStyle(false, 'secondary')} onClick={onDismiss}>
              Dismiss
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={titleStyle}>File Transfer</p>
      </div>
      {renderContent()}
    </div>
  );
}
