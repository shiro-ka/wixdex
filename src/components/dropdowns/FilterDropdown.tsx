import { useState, useEffect, ReactNode } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onClearAll: () => void;
}

function FilterDropdown({ isOpen, onClose, title, children, onClearAll }: FilterDropdownProps) {
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
      className={`fixed top-0 left-0 w-dvw bg-zinc-800 border-b border-gray-700 shadow-lg z-50 p-4 ${isClosing ? 'animate-slide-up' : 'animate-slide-down'
        }`}
    >
      <div
        className={`max-w-screen-md mx-auto ${isClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-semibold">{title}</h3>
          <button
            onClick={onClearAll}
            className="!text-gray-400 hover:!text-gray-300 !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
            aria-label="チェック全解除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M8.56 3.69a9 9 0 0 0 -2.92 1.95" />
              <path d="M3.69 8.56a9 9 0 0 0 -.69 3.44" />
              <path d="M3.69 15.44a9 9 0 0 0 1.95 2.92" />
              <path d="M8.56 20.31a9 9 0 0 0 3.44 .69" />
              <path d="M15.44 20.31a9 9 0 0 0 2.92 -1.95" />
              <path d="M20.31 15.44a9 9 0 0 0 .69 -3.44" />
              <path d="M20.31 8.56a9 9 0 0 0 -1.95 -2.92" />
              <path d="M15.44 3.69a9 9 0 0 0 -3.44 -.69" />
              <path d="M9 12l2 2l4 -4" />
            </svg>
          </button>
        </div>

        <div>{children}</div>

        <button
          onClick={handleClose}
          className="w-full mt-4 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg p-2 transition-all flex items-center justify-center gap-2"
        >
          <ChevronUpIcon className="w-5 h-5" />
          <span className="text-sm">閉じる</span>
        </button>
      </div>
    </div>
  );
}

export default FilterDropdown;
