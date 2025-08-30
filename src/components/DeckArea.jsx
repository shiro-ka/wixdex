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
    <div className='flex flex-col gap-4 w-full md:flex-1'>
      {/* ルリグデッキ */}
      <div className='flex flex-col gap-4 w-full h-fit'>
        <div className='flex flex-col w-full h-fit'>
          <div className='flex w-full'>
            <div className='p-2 w-48 md:h-12 rounded-t-lg bg-gray-600/20'>
              <img src={`${basePath}/assets/girl/LrigDeck.png`} alt="LrigDeck" className='w-full h-full object-contain mb-2'/>
              <div className="h-px mx-4 bg-white/20"></div>
            </div>
          </div>
          <div className='w-full lg:h-14 xl:h-30 rounded-b-lg bg-gray-600/20 p-4'>
            <div className='lrigDeck w-full h-full grid grid-cols-[repeat(8,_1fr)] grid-rows-[1fr] gap-x-2'>
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
        </div>
        <div className='flex flex-col w-full'>
          <div className='flex w-full'>
            <div className='p-2 w-48 md:h-12 rounded-t-lg bg-gray-600/20'>
              <img src={`${basePath}/assets/girl/MainDeck.png`} alt="MainDeck" className='w-full h-full object-contain mb-2'/>
              <div className="h-px mx-4 bg-white/20"></div>
            </div>
            <div className="flex items-center gap-2">
              <span>LB：</span>
              <span className="text-lg font-bold">{lifeBurstCount}</span>
            </div>
          </div>
          <div className='w-full h-fit rounded-b-lg bg-gray-600/20 p-4'>
            <div className='mainDeck w-full xl:h-112 grid grid-cols-[repeat(8,_1fr)] grid-rows-[repeat(5,_1fr)] gap-x-2'>
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
        </div>
      </div>
      <div className='md:grow bg-gray-600/20 p-4 rounded-lg'>
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