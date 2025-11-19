interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <span className="loading loading-spinner text-primary loading-lg"></span>
        {message && <p className="text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
