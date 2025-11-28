interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-900">
      <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
        <h2 className="text-white text-xl font-bold mb-2">エラー</h2>
        <p className="text-red-200">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}

export default ErrorMessage;
