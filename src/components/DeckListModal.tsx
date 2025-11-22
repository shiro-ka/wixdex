import { XMarkIcon } from '@heroicons/react/24/outline';
import type { SavedDeck } from '../hooks/useDeckStorage';

interface DeckListModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: SavedDeck[];
  onSelectDeck: (deck: SavedDeck) => void;
}

function DeckListModal({ isOpen, onClose, decks, onSelectDeck }: DeckListModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-zinc-800 border border-neutral-700 z-50 rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">デッキ一覧</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2">
          {decks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">保存されたデッキがありません</p>
          ) : (
            decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => {
                  onSelectDeck(deck);
                  onClose();
                }}
                className="w-full text-left p-4 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <div className="text-white font-medium">{deck.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  メイン: {deck.mainDeck.length}枚 / ルリグ: {deck.lrigDeck.length}枚
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(deck.updatedAt).toLocaleString('ja-JP')}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default DeckListModal;
