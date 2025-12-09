export function SuccessMessage({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
      <span className="text-2xl mr-3">✅</span>
      <div className="flex-1">
        <p className="text-green-800 font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-green-600 hover:text-green-800">×</button>
      )}
    </div>
  );
}

export function ErrorMessage({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
      <span className="text-2xl mr-3">❌</span>
      <div className="flex-1">
        <p className="text-red-800 font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-red-600 hover:text-red-800">×</button>
      )}
    </div>
  );
}

export function InfoMessage({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
      <span className="text-2xl mr-3">ℹ️</span>
      <div className="flex-1">
        <p className="text-blue-800 font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-blue-600 hover:text-blue-800">×</button>
      )}
    </div>
  );
}

export function WarningMessage({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
      <span className="text-2xl mr-3">⚠️</span>
      <div className="flex-1">
        <p className="text-yellow-800 font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-yellow-600 hover:text-yellow-800">×</button>
      )}
    </div>
  );
}
