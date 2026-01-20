import type { LargeFileWarning as LargeFileWarningType } from '../../shared/types';

interface LargeFileWarningProps {
  warning: LargeFileWarningType;
  onProceed: () => void;
  onCancel: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#252540',
  borderRadius: '12px',
  padding: '24px',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
  margin: '0 0 12px 0',
  color: '#f59e0b',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const messageStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#eaeaea',
  margin: '0 0 16px 0',
  lineHeight: 1.5,
};

const fileListStyle: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '16px',
};

const fileItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #374151',
};

const fileNameStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#eaeaea',
  wordBreak: 'break-all',
  maxWidth: '70%',
};

const fileSizeStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#f59e0b',
  fontWeight: 600,
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '8px',
};

const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => ({
  padding: '8px 16px',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  backgroundColor: variant === 'primary' ? '#6366f1' : '#374151',
  color: '#ffffff',
});

const noteStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#9ca3af',
  margin: '0 0 16px 0',
  fontStyle: 'italic',
};

export default function LargeFileWarning({ warning, onProceed, onCancel }: LargeFileWarningProps) {
  const hasOtherFiles = warning.files.length > 0;

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>
          <span>!</span>
          Large File Warning
        </h2>

        <p style={messageStyle}>
          The following files exceed 4GB and cannot be transferred to a {warning.filesystemType} drive:
        </p>

        <div style={fileListStyle}>
          {warning.files.map((file, index) => (
            <div
              key={file.path}
              style={{
                ...fileItemStyle,
                borderBottom: index === warning.files.length - 1 ? 'none' : '1px solid #374151',
              }}
            >
              <span style={fileNameStyle}>{file.filename}</span>
              <span style={fileSizeStyle}>{file.sizeHuman}</span>
            </div>
          ))}
        </div>

        {hasOtherFiles && (
          <p style={noteStyle}>
            These files will be skipped. Other selected files will be transferred.
          </p>
        )}

        <div style={buttonContainerStyle}>
          <button style={buttonStyle('secondary')} onClick={onCancel}>
            Cancel
          </button>
          <button style={buttonStyle('primary')} onClick={onProceed}>
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
