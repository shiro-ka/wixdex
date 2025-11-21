import { useState, useEffect } from 'react';

/**
 * 共通ドロップダウンラッパーコンポーネント
 * 画面上部からスライドダウンするドロップダウンメニューを提供
 *
 * @param {boolean} isOpen - ドロップダウンが開いているかどうか
 * @param {function} onClose - 閉じるときのコールバック
 * @param {string} title - ドロップダウンのタイトル
 * @param {React.ReactNode} children - ドロップダウンの中身
 */
function FilterDropdown({ isOpen, onClose, title, children }) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // isOpenの変化を監視
  useEffect(() => {
    if (isOpen) {
      // 開く時は即座にレンダリング開始
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      // 閉じる時はアニメーション開始
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200); // アニメーション時間と同じ
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  const handleClose = () => {
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-dvw bg-zinc-800 border-b border-gray-700 shadow-lg z-50 p-4 ${
        isClosing ? 'animate-slide-up' : 'animate-slide-down'
      }`}
    >
      <div
        className={`max-w-screen-md mx-auto ${
          isClosing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
      >
        <h3 className="text-white text-sm font-semibold mb-3">{title}</h3>

        {/* ドロップダウンの中身 */}
        <div className="mb-4">{children}</div>

        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

export default FilterDropdown;