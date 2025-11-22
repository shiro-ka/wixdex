import { XMarkIcon, FolderIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckListClick: () => void;
}

function Sidebar({ isOpen, onClose, onDeckListClick }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* サイドバー */}
      <div className="fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-neutral-700 z-50 shadow-xl p-4">
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
              onDeckListClick();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-white"
          >
            <FolderIcon className="w-5 h-5" />
            <span>デッキ一覧</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
