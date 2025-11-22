import type { SavedDeck } from '../hooks/useDeckStorage';
import { BaseModal } from './BaseModal';

interface DeckListModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: SavedDeck[];
  onSelectDeck: (deck: SavedDeck) => void;
}

function DeckListModal({ isOpen, onClose, decks, onSelectDeck }: DeckListModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="デッキ一覧"
    >
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
    </BaseModal>
  );
}

export default DeckListModal;
