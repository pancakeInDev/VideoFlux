import type { LargeFileWarning as LargeFileWarningType } from '../../shared/types';

interface LargeFileWarningProps {
  warning: LargeFileWarningType;
  onProceed: () => void;
  onCancel: () => void;
}

export default function LargeFileWarning({ warning, onProceed, onCancel }: LargeFileWarningProps) {
  const hasOtherFiles = warning.files.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-[500px] w-[90%] max-h-[80vh] overflow-auto shadow-apple-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold m-0 mb-3 text-apple-yellow flex items-center gap-2">
          <span>!</span>
          Large File Warning
        </h2>

        <p className="text-sm text-apple-text-primary m-0 mb-4 leading-relaxed">
          The following files exceed 4GB and cannot be transferred to a {warning.filesystemType} drive:
        </p>

        <div className="bg-apple-bg-secondary rounded-lg p-3 mb-4">
          {warning.files.map((file, index) => (
            <div
              key={file.path}
              className={`flex justify-between items-center py-2 ${index !== warning.files.length - 1 ? 'border-b border-apple-border' : ''}`}
            >
              <span className="text-sm text-apple-text-primary break-all max-w-[70%]">{file.filename}</span>
              <span className="text-sm text-apple-yellow font-semibold">{file.sizeHuman}</span>
            </div>
          ))}
        </div>

        {hasOtherFiles && (
          <p className="text-xs text-apple-text-secondary m-0 mb-4 italic">
            These files will be skipped. Other selected files will be transferred.
          </p>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button
            className="bg-apple-bg-secondary text-apple-text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-150"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-apple-blue text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-150"
            onClick={onProceed}
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
