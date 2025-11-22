import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Markdown from 'react-markdown';

interface DeckEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentMemo: string;
  onSave: (name: string, memo: string) => void;
}

function DeckEditModal({ isOpen, onClose, currentName, currentMemo, onSave }: DeckEditModalProps) {
  const [name, setName] = useState(currentName);
  const [memo, setMemo] = useState(currentMemo);
  const [isPreview, setIsPreview] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(name, memo);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl bg-zinc-800 border border-neutral-700 z-50 rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">デッキ編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* デッキ名入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">デッキ名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="デッキ名を入力"
            />
          </div>

          {/* メモ入力/プレビュー切り替え */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">メモ</label>
              <button
                onClick={() => setIsPreview(!isPreview)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {isPreview ? '編集' : 'プレビュー'}
              </button>
            </div>

            {isPreview ? (
              <div className="w-full min-h-[200px] px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white prose prose-invert prose-sm max-w-none">
                <Markdown>{memo || '*メモがありません*'}</Markdown>
              </div>
            ) : (
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full min-h-[200px] px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 font-mono text-sm"
                placeholder="メモを入力（マークダウン対応）"
              />
            )}
            <p className="text-xs text-gray-500 mt-1">マークダウン記法が使えます</p>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeckEditModal;
