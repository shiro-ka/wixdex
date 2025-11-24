import type { Card } from '../types';

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
              {isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#dddddd" className="w-6 h-6">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dddddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                </svg>
              )}
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
