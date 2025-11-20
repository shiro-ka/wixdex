import { PlusIcon, MinusIcon, ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import LazyImage from './LazyImage';

function CardList({ cards, onAdd, onRemove, onCardHover, onAddToCandidate, onCardClick, basePath }) {
  return (
    <div className="flex-grow-1">
      <div
        className="flex gap-2 overflow-x-auto max-w-full py-3"
        style={{ touchAction: 'pan-x' }}
      >
        {cards.map((card, index) => (
          <div key={`${card.id}-${index}`}>
            {/* カード */}
            <div className="flex w-16 h-full items-center justify-center cursor-pointer"
              // カード追加(フリック)
              onTouchStart={(e) => {
                const imgElement = e.currentTarget.querySelector('img');
                imgElement._touchStartY = e.touches[0].clientY;
                imgElement._touchStartX = e.touches[0].clientX;
                imgElement._isVerticalSwipe = false;
                imgElement.style.transition = 'none';
              }}
              onTouchMove={(e) => {
                const imgElement = e.currentTarget.querySelector('img');
                const startY = imgElement._touchStartY;
                const startX = imgElement._touchStartX;
                const currentY = e.touches[0].clientY;
                const currentX = e.touches[0].clientX;
                const deltaY = Math.abs(startY - currentY);
                const deltaX = Math.abs(startX - currentX);

                // 縦方向の動きが横より大きい、かつ5px以上動いたら縦スワイプモード
                if (deltaY > deltaX && deltaY > 5) {
                  e.preventDefault(); // 横スクロールを防ぐ
                  imgElement._isVerticalSwipe = true;

                  // カードを動かす（最大10pxまで）
                  const signedDeltaY = startY - currentY;
                  const translateY = Math.max(-10, Math.min(10, -signedDeltaY));
                  imgElement.style.transform = `translateY(${translateY}px)`;
                }
              }}
              onTouchEnd={(e) => {
                const imgElement = e.currentTarget.querySelector('img');
                const startY = imgElement._touchStartY;
                const endY = e.changedTouches[0].clientY;

                // アニメーション付きで元の位置に戻す
                imgElement.style.transition = 'transform 0.2s ease-out';
                imgElement.style.transform = 'translateY(0)';

                if (imgElement._isVerticalSwipe && startY - endY > 30) {
                  onAdd(card);
                }
              }}
            >
              <LazyImage
                src={`${basePath}/assets/cards_img/${card.image}`}
                className="object-contain"
                alt={card.name}
                onMouseEnter={() => onCardHover(card)}
                onClick={() => onCardClick(card)}
              />
            </div>
            {/* 操作ボタン(PC) */}
            <div className="hidden flex gap-2 w-full h-10 mt-2 justify-center">
              <button
                className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onAdd(card)}
                title="追加"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
              <button
                className="hidden bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onRemove(card)}
                title="削除"
              >
                <MinusIcon className="w-5 h-5" />
              </button>
              <button
                className="hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onAddToCandidate(card)}
                title="候補へ"
              >
                <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardList;