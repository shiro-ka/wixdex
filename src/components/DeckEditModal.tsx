import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { BaseModal } from './BaseModal';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNameEditMode, setIsNameEditMode] = useState(false);

  // propsが変更されたらstateを更新
  useEffect(() => {
    setName(currentName);
    setMemo(currentMemo);
  }, [currentName, currentMemo]);

  const handleClose = () => {
    // 閉じる時に自動保存
    onSave(name, memo);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="デッキ編集"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* デッキ名入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">デッキ名</label>
          {isNameEditMode ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setIsNameEditMode(false)}
              autoFocus
              className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="デッキ名を入力"
            />
          ) : (
            <div
              onClick={() => setIsNameEditMode(true)}
              className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white cursor-text hover:bg-zinc-700/80 transition-colors"
            >
              {name || 'デッキ名を入力'}
            </div>
          )}
        </div>

        {/* メモ入力/プレビュー */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">メモ</label>

          {isEditMode ? (
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onBlur={() => setIsEditMode(false)}
              autoFocus
              className="w-full min-h-[200px] px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 font-mono text-sm"
              placeholder="メモを入力（マークダウン対応）"
            />
          ) : (
            <div
              onClick={() => setIsEditMode(true)}
              className="w-full min-h-[200px] px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white prose prose-invert prose-sm max-w-none cursor-text hover:bg-zinc-700/80 transition-colors"
            >
              <Markdown>{memo || '*メモをクリックして編集*'}</Markdown>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode ? 'マークダウン記法が使えます（クリック外で保存）' : 'クリックして編集'}
          </p>
        </div>
      </div>
    </BaseModal>
  );
}

export default DeckEditModal;
