import type { SavedDeck } from '../hooks/useDeckStorage';
import { BaseModal } from './BaseModal';

interface DeckListModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: SavedDeck[];
  onSelectDeck: (deck: SavedDeck) => void;
  onDeleteDeck: (deckId: string) => void;
}

function DeckListModal({ isOpen, onClose, decks, onSelectDeck, onDeleteDeck }: DeckListModalProps) {
  const handleDelete = (e: React.MouseEvent, deckId: string, deckName: string) => {
    e.stopPropagation();
    if (window.confirm(`「${deckName}」を削除しますか？`)) {
      onDeleteDeck(deckId);
    }
  };

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
            <div
              key={deck.id}
              className="flex w-full bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <button
                onClick={() => {
                  onSelectDeck(deck);
                  onClose();
                }}
                className="flex-1 text-left p-4"
              >
                <div className="text-white font-medium">{deck.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  メイン: {deck.mainDeck.length}枚 / ルリグ: {deck.lrigDeck.length}枚
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(deck.updatedAt).toLocaleString('ja-JP')}
                </div>
              </button>
              <button
                onClick={(e) => handleDelete(e, deck.id, deck.name)}
                className="flex items-center justify-center w-12 text-gray-400 hover:text-red-400 transition-colors"
                title="デッキを削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4 7l16 0" />
                  <path d="M10 11l0 6" />
                  <path d="M14 11l0 6" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </BaseModal>
  );
}

export default DeckListModal;
