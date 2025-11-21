import { useState, useEffect, ReactNode } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function FilterDropdown({ isOpen, onClose, title, children }: FilterDropdownProps) {
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
      }, 200);
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-semibold">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="閉じる"
          >
            <ChevronUpIcon className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

export default FilterDropdown;
