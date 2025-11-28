function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">カードデータを読み込んでいます...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
