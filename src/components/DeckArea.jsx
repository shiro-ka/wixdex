import { PlusIcon, MinusIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

function DeckArea({ mainDeck, lrigDeck, onCardHover, onAdd, onRemove, candidateCards, onAddToCandidate, onRemoveFromCandidate, onCardClick, lifeBurstCount, basePath }) {
  const handleWheel = (e, card) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      onAdd(card);
    } else {
      onRemove(card);
    }
  };

  const handleTouchStart = (e) => {
    e.currentTarget._touchStartY = e.touches[0].clientY;
    e.currentTarget._touchStartX = e.touches[0].clientX;
    e.currentTarget._isVerticalSwipe = false;
    e.currentTarget.style.transition = 'none';
  };

  const handleTouchMove = (e) => {
    const startY = e.currentTarget._touchStartY;
    const startX = e.currentTarget._touchStartX;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = Math.abs(startY - currentY);
    const deltaX = Math.abs(startX - currentX);

    // 縦方向の動きが横より大きい、かつ15px以上動いたら縦スワイプモード
    if (deltaY > deltaX && deltaY > 15) {
      e.preventDefault(); // 横スクロールを防ぐ
      e.currentTarget._isVerticalSwipe = true;

      // カードを動かす（最大10pxまで）
      const signedDeltaY = startY - currentY;
      const translateY = Math.max(-10, Math.min(10, -signedDeltaY));
      e.currentTarget.style.transform = `translateY(${translateY}px)`;
    }
  };

  const handleTouchEnd = (e, card) => {
    const startY = e.currentTarget._touchStartY;
    const endY = e.changedTouches[0].clientY;
    const deltaY = startY - endY;

    // アニメーション付きで元の位置に戻す
    e.currentTarget.style.transition = 'transform 0.2s ease-out';
    e.currentTarget.style.transform = 'translateY(0)';

    // 縦スワイプモードの時だけカード追加/削除を実行
    if (e.currentTarget._isVerticalSwipe) {
      if (deltaY > 30) {
        // 上にスワイプ → 追加
        onAdd(card);
      } else if (deltaY < -30) {
        // 下にスワイプ → 削除
        onRemove(card);
      }
    }
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
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => handleTouchEnd(e, card)}
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
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => handleTouchEnd(e, card)}
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