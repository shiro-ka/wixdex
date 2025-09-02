import headerLrigDeck from '../assets/girl/LrigDeck.png';
import headerMainDeck from '../assets/girl/MainDeck.png';
import { PlusIcon, MinusIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

function DeckArea({ mainDeck, lrigDeck, onHover, onAdd, onRemove, candidateCards, onAddToCandidate, onRemoveFromCandidate, onCardClick, lifeBurstCount, basePath }) {
  const handleWheel = (e, card) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      onAdd(card);
    } else {
      onRemove(card);
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* ルリグデッキ */}
      <div className='h-fit px-4 py-2 mb-4 bg-gray-600/10 rounded-xl'>
        <div className='flex w-full'>
          <span>Lrig Deck</span>
        </div>
        <div className='lrigDeck grid w-full h-[calc(32dvw-4rem)] grid-cols-[repeat(8,_1fr)] grid-rows-[1fr] gap-x-2'>
          {lrigDeck.map((card, index) => (
            <div key={`${card.id}-${index}`} className="flex items-center">
              <img
                src={`${basePath}/assets/cards_img/${card.image}`}
                className="w-full object-contain cursor-pointer"
                alt={card.name}
                onMouseEnter={() => onHover(card)}
                onWheel={(e) => handleWheel(e, card)}
                onClick={() => onCardClick(card)}
              />
            </div>
          ))}
        </div>
      </div>
      {/* メインデッキ */}
      <div className='h-fit px-4 py-2 mb-4 bg-gray-600/10 rounded-xl'>
        <div className='flex w-full'>
          <span>Main Deck</span>
          <span>LB：</span>
          <span>{lifeBurstCount}</span>
        </div>
        <div className='mainDeck grid w-full h-[calc(90dvw-4rem)] grid-cols-[repeat(8,_1fr)] grid-rows-[repeat(5,_1fr)] gap-x-2'>
          {mainDeck.map((card, index) => (
            <div key={`${card.id}-${index}`} className="flex items-center">
              <img
                src={`${basePath}/assets/cards_img/${card.image}`}
                className="w-full object-contain cursor-pointer"
                alt={card.name}
                onMouseEnter={() => onHover(card)}
                onWheel={(e) => handleWheel(e, card)}
                onClick={() => onCardClick(card)}
              />
            </div>
          ))}
        </div>
      </div>
        {/* 候補カードリスト */}
        <div className='hidden flex-1 bg-gray-600/20 p-4 rounded-lg'>
          <div className="w-fit mx-auto grid gap-2 overflow-x-auto
                          md:grid-cols-[repeat(2,_7.5rem)] md:grid-rows-[content-fit] md:overflow-y-auto md:max-h-full
                          lg:grid-cols-[repeat(3,_7.5rem)]
                          2xl:grid-cols-[repeat(4,_7.5rem)]">
            {candidateCards.map((card) => (
              <div className="w-full h-fit" key={card.id}>
                <div className="flex w-full h-42 items-center">
                  <img
                    src={`${basePath}/assets/cards_img/${card.image}`}
                    className="w-full object-contain cursor-pointer"
                    onMouseEnter={() => onHover(card)}
                    onClick={() => onCardClick(card)}
                  />
                </div>
                <div className="flex w-full h-8 flex-row">
                  <div className="flex flex-1 items-center justify-center" onClick={() => onAdd(card)}>
                    <PlusIcon className="w-4 h-4"/>
                  </div>
                  <div className="flex flex-1 items-center justify-center" onClick={() => onRemove(card)}>
                    <MinusIcon className="w-4 h-4"/>
                  </div>
                  <div className="flex flex-1 items-center justify-center" onClick={() => onRemoveFromCandidate(card)}>
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

export default DeckArea;