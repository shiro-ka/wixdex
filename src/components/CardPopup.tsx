import type { Card } from '../types';
import { StarIcon } from './icons/StarIcon';

interface CardPopupProps {
  card: Card | null;
  onClose: () => void;
  basePath: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function CardPopup({ card, onClose, basePath, isFavorite, onToggleFavorite }: CardPopupProps) {
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-2 rounded-xl w-[90vw] max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex w-full items-stretch justify-center">
          <img
            src={`${basePath}/assets/cards_img/${card.image}`}
            className="w-full aspect-[3/4] object-contain"
            alt={card.name}
          />
          <div className="w-32 flex flex-col items-center pt-2">
            <button
              onClick={onToggleFavorite}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
              title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
            >
              <StarIcon filled={isFavorite} className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
        <div className="w-full h-16 flex items-center justify-center">
        </div>
      </div>

    </div>
  );
}

export default CardPopup;
