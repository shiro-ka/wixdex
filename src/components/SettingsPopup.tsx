import { useState, useEffect } from 'react';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  showLifeBurst: boolean;
  onToggleLifeBurst: () => void;
  showCandidateIcon: boolean;
  onToggleCandidateIcon: () => void;
}

function SettingsPopup({ isOpen, onClose, showLifeBurst, onToggleLifeBurst, showCandidateIcon, onToggleCandidateIcon }: SettingsPopupProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!shouldRender) return null;

  const CheckboxIcon = ({ checked }: { checked: boolean }) => {
    if (checked) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-orange-400 group-hover:text-orange-300 flex-shrink-0 transition-colors">
          <path fill="currentColor" d="M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM342 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L189.1 315.2 137 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.9 7.5 18.8 7s13.4-4.1 17.5-9.8L347.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0 transition-colors">
        <path fill="currentColor" d="M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zm230.7 89.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L211.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z" />
      </svg>
    );
  };

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className={`fixed inset-0 z-30 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'
          }`}
        onClick={handleClose}
      />

      {/* ポップアップ */}
      <div
        className={`absolute bottom-full left-0 mb-2 w-64 bg-zinc-800 border border-neutral-700 rounded-lg shadow-xl z-40 transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
      >
        <div className="p-4">
          <h3 className="text-white text-sm font-semibold mb-3">設定</h3>

          <div className="space-y-2">
            <label
              className="group flex items-center space-x-2 text-white cursor-pointer"
              onClick={onToggleLifeBurst}
            >
              <CheckboxIcon checked={showLifeBurst} />
              <span className="text-sm">LBアイコンを表示</span>
            </label>
            <label
              className="group flex items-center space-x-2 text-white cursor-pointer"
              onClick={onToggleCandidateIcon}
            >
              <CheckboxIcon checked={showCandidateIcon} />
              <span className="text-sm">候補カードアイコンを表示</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPopup;
