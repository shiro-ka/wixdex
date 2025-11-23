import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckListClick: () => void;
  onNewDeckClick: () => void;
}

function Sidebar({ isOpen, onClose, onDeckListClick, onNewDeckClick }: SidebarProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* サイドバー */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-neutral-700 z-50 shadow-xl p-4 transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
            aria-label="閉じる"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => {
              onNewDeckClick();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M7 3m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
              <path d="M4.012 7.26a2.005 2.005 0 0 0 -1.012 1.737v10c0 1.1 .9 2 2 2h10c.75 0 1.158 -.385 1.5 -1" />
              <path d="M11 10h6" />
              <path d="M14 7v6" />
            </svg>
            <span>新しいデッキを作成</span>
          </button>
          <button
            onClick={() => {
              onDeckListClick();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M7 3m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
              <path d="M4.012 7.26a2.005 2.005 0 0 0 -1.012 1.737v10c0 1.1 .9 2 2 2h10c.75 0 1.158 -.385 1.5 -1" />
              <path d="M11 7h5" />
              <path d="M11 10h6" />
              <path d="M11 13h3" />
            </svg>
            <span>デッキ一覧</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
