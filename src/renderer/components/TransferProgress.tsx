import type { TransferProgress as TransferProgressType } from '../../shared/types';

interface TransferProgressProps {
  progress: TransferProgressType;
  onCancel: () => void;
  onDismiss: () => void;
  onStartTransfer: () => void;
  canStartTransfer: boolean;
}

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
          <div className="text-center py-4">
            <button
              className="bg-apple-blue text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-150 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              onClick={onStartTransfer}
              disabled={!canStartTransfer}
            >
              Start Transfer
            </button>
            {!canStartTransfer && (
              <p className="text-sm text-apple-text-secondary m-0 mt-2">
                Select videos and destination to start transfer
              </p>
            )}
          </div>
        );

      case 'checking':
        return <p className="text-sm text-apple-text-secondary text-center py-4 m-0">Checking files...</p>;

      case 'transferring': {
        const { currentFile, currentFileIndex = 0, totalFiles = 0, fileProgress = 0 } = progress;
        const overallProgress = totalFiles > 0
          ? Math.floor(((currentFileIndex + fileProgress / 100) / totalFiles) * 100)
          : 0;

        return (
          <>
            <div>
              <p className="text-sm text-apple-text-secondary m-0">
                Transferring file {currentFileIndex + 1} of {totalFiles}
              </p>
              {currentFile && <p className="text-sm text-apple-text-primary m-0 break-all">{currentFile}</p>}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-apple-blue transition-[width] duration-200 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-sm text-apple-text-secondary m-0">{overallProgress}% complete</p>
            <button
              className="bg-apple-red text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-150"
              onClick={onCancel}
            >
              Cancel
            </button>
          </>
        );
      }

      case 'complete': {
        const { completedFiles = [], failedFiles = [], totalFiles = 0 } = progress;

        return (
          <>
            <div className="flex flex-col gap-2 bg-apple-bg-secondary rounded-lg p-3">
              <p className="text-sm font-semibold text-apple-text-primary m-0">Transfer Complete</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-apple-text-secondary">Total files:</span>
                <span className="text-apple-text-primary">{totalFiles}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-apple-text-secondary">Successful:</span>
                <span className="text-apple-green">{completedFiles.length}</span>
              </div>
              {failedFiles.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-apple-text-secondary">Failed:</span>
                  <span className="text-apple-red">{failedFiles.length}</span>
                </div>
              )}
            </div>

            {failedFiles.length > 0 && (
              <div className="mt-2 p-3 bg-red-50 rounded-lg text-xs">
                <p className="m-0 mb-2 font-semibold text-red-800">
                  Failed transfers:
                </p>
                {failedFiles.map((file, index) => (
                  <div
                    key={file.path}
                    className={`flex flex-col gap-0.5 py-1.5 ${index !== failedFiles.length - 1 ? 'border-b border-red-200' : ''}`}
                  >
                    <span className="text-red-800 font-medium">
                      {file.path.split('/').pop()}
                    </span>
                    <span className="text-red-700">{file.error}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="bg-apple-bg-secondary text-apple-text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-150"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          </>
        );
      }

      case 'cancelled': {
        const { completedFiles = [], failedFiles = [] } = progress;

        return (
          <>
            <div className="flex flex-col gap-2 bg-apple-bg-secondary rounded-lg p-3">
              <p className="text-sm font-semibold text-apple-yellow m-0">
                Transfer Cancelled
              </p>
              {completedFiles.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-apple-text-secondary">Files transferred before cancel:</span>
                  <span className="text-apple-green">{completedFiles.length}</span>
                </div>
              )}
              {failedFiles.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-apple-text-secondary">Failed:</span>
                  <span className="text-apple-red">{failedFiles.length}</span>
                </div>
              )}
            </div>

            <button
              className="bg-apple-bg-secondary text-apple-text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-150"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          </>
        );
      }

      case 'error':
        return (
          <>
            <div className="flex flex-col gap-2 bg-apple-bg-secondary rounded-lg p-3">
              <p className="text-sm font-semibold text-apple-red m-0">
                Transfer Error
              </p>
              {progress.errorMessage && (
                <p className="text-sm text-apple-red m-0">{progress.errorMessage}</p>
              )}
            </div>

            <button
              className="bg-apple-bg-secondary text-apple-text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-150"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-apple p-6 w-full max-w-[700px] flex flex-col gap-3">
      <div className="flex justify-between items-center gap-3">
        <p className="text-base font-semibold text-apple-text-primary m-0">File Transfer</p>
      </div>
      {renderContent()}
    </div>
  );
}
