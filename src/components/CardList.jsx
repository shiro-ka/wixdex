import { PlusIcon, MinusIcon, ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';

function CardList({ cards, onAdd, onRemove, onHover, onAddToCandidate, onCardClick }) {
  return (
    <div className="border border-neutral-700 rounded-xl p-2
                    w-full md:w-96 2xl:w-140 
                    h-24 md:h-full">
      <div className="grid w-full gap-2 overflow-x-auto
                      md:grid-cols-[repeat(2,_8rem)] md:grid-rows-[content-fit] md:overflow-y-auto md:max-h-full
                      lg:grid-cols-[repeat(3,_8rem)]
                      xl:grid-cols-[repeat(3,_8rem)]
                      2xl:grid-cols-[repeat(4,_8rem)]">
        {cards.map((card) => (
          <div className="w-full h-fit" key={card.id}>
            <div className="flex w-full xl:h-48 items-center">
              <img
                src={`/assets/cards_img/${card.image}`}
                className="w-full object-contain cursor-pointer"
                onMouseEnter={() => onHover(card)}
                onClick={() => onCardClick(card)}
              />
            </div>
            <div className="hidden gap-0.5 md:flex md:w-full md:h-8 md:flex-row">
              <div className="flex flex-1 items-center justify-center" onClick={() => onAdd(card)}>
                <PlusIcon className="w-4 h-4"/>
              </div>
              <div className="flex flex-1 items-center justify-center" onClick={() => onRemove(card)}>
                <MinusIcon className="w-4 h-4"/>
              </div>
              <div className="flex flex-1 items-center justify-center" onClick={() => onAddToCandidate(card)}>
                <ArrowLeftEndOnRectangleIcon className="w-4 h-4"/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardList;