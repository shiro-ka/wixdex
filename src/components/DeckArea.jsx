import { PlusIcon, MinusIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';

function DeckArea({ mainDeck, lrigDeck, onCardHover, onAdd, onRemove, candidateCards, onAddToCandidate, onRemoveFromCandidate, onCardClick, lifeBurstCount, basePath }) {
  const touchStateRef = useRef(new Map());

  const handleWheel = (e, card) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      onAdd(card);
    } else {
      onRemove(card);
    }
  };

  const handleTouchStart = (e, uniqueKey) => {
    const element = e.currentTarget;
    touchStateRef.current.set(uniqueKey, {
      startY: e.touches[0].clientY,
      startX: e.touches[0].clientX,
      isVerticalSwipe: false,
      element: element
    });
    element.style.transition = 'none';
  };

  const handleTouchMove = (e, uniqueKey) => {
    const state = touchStateRef.current.get(uniqueKey);
    if (!state) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = Math.abs(state.startY - currentY);
    const deltaX = Math.abs(state.startX - currentX);

    // 縦方向の動きが横より大きい、かつ15px以上動いたら縦スワイプモード
    if (deltaY > deltaX && deltaY > 15) {
      e.preventDefault(); // 横スクロールを防ぐ
      state.isVerticalSwipe = true;

      // カードを動かす（最大10pxまで）
      const signedDeltaY = state.startY - currentY;
      const translateY = Math.max(-10, Math.min(10, -signedDeltaY));
      state.element.style.transform = `translateY(${translateY}px)`;
    }
  };

  const handleTouchEnd = (e, uniqueKey, card, index, deckType) => {
    const state = touchStateRef.current.get(uniqueKey);
    if (!state) return;

    const endY = e.changedTouches[0].clientY;
    const deltaY = state.startY - endY;

    // アニメーション付きで元の位置に戻す
    state.element.style.transition = 'transform 0.2s ease-out';
    state.element.style.transform = 'translateY(0)';

    // 縦スワイプモードの時だけカード追加/削除を実行
    if (state.isVerticalSwipe) {
      if (deltaY > 30) {
        // 上にスワイプ → 追加
        onAdd(card);
      } else if (deltaY < -30) {
        // 下にスワイプ → 削除（このインデックスのカードを削除）
        onRemove(card, index, deckType);
      }
    }

    // クリーンアップ
    touchStateRef.current.delete(uniqueKey);
  };

  return (
    <div className='flex flex-col flex-shrink-0 px-2 mb-4'>
      {/* ルリグデッキ */}
      <div className='h-fit px-4 py-2 mb-2 bg-zinc-800/10 rounded-xl'>
        <div className='flex w-full'>
          <span>Lrig Deck</span>
        </div>
        <div className='lrigDeck grid w-full h-[calc(32dvw-4rem)] grid-cols-[repeat(8,_1fr)] grid-rows-[1fr] gap-x-1'>
          {lrigDeck.map((card, index) => (
            <div key={`${card.id}-${index}`} className="flex items-center">
              <img
                src={`${basePath}/assets/cards_img/${card.image}`}
                className="w-full object-contain cursor-pointer"
                alt={card.name}
                onMouseEnter={() => onCardHover(card)}
                onWheel={(e) => handleWheel(e, card)}
                onTouchStart={(e) => handleTouchStart(e, `lrig-${card.id}-${index}`)}
                onTouchMove={(e) => handleTouchMove(e, `lrig-${card.id}-${index}`)}
                onTouchEnd={(e) => handleTouchEnd(e, `lrig-${card.id}-${index}`, card, index, 'lrig')}
                onClick={() => onCardClick(card)}
              />
            </div>
          ))}
        </div>
      </div>
      {/* メインデッキ */}
      <div className='h-fit px-4 py-2 bg-zinc-800/10 rounded-xl'>
        <div className='flex w-full'>
          <span>Main Deck</span>
          <span>LB：</span>
          <span>{lifeBurstCount}</span>
        </div>
        <div className='mainDeck grid w-full h-[calc(90dvw-4rem)] grid-cols-[repeat(8,_1fr)] grid-rows-[repeat(5,_1fr)] gap-x-1'>
          {mainDeck.map((card, index) => (
            <div key={`${card.id}-${index}`} className="flex items-center">
              <img
                src={`${basePath}/assets/cards_img/${card.image}`}
                className="w-full object-contain cursor-pointer"
                alt={card.name}
                onMouseEnter={() => onCardHover(card)}
                onWheel={(e) => handleWheel(e, card)}
                onTouchStart={(e) => handleTouchStart(e, `main-${card.id}-${index}`)}
                onTouchMove={(e) => handleTouchMove(e, `main-${card.id}-${index}`)}
                onTouchEnd={(e) => handleTouchEnd(e, `main-${card.id}-${index}`, card, index, 'main')}
                onClick={() => onCardClick(card)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeckArea;