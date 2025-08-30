import { PlusIcon, MinusIcon, ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';

function CardList({ cards, onAdd, onRemove, onHover, onAddToCandidate, onCardClick, basePath }) {
  return (
    <div className="border border-neutral-700 rounded-2xl p-4 bg-neutral-900 shadow-xl
                    w-full md:w-96 2xl:w-140 
                    h-32 md:h-full transition-all duration-300">
      <div className="flex w-full gap-4 overflow-x-auto
                      md:grid
                      md:grid-cols-[repeat(2,_8rem)] md:grid-rows-[content-fit] md:overflow-y-auto md:max-h-full
                      lg:grid-cols-[repeat(3,_8rem)]
                      xl:grid-cols-[repeat(3,_8rem)]
                      2xl:grid-cols-[repeat(4,_8rem)]">
        {cards.map((card) => (
          <div
            className="w-full h-fit bg-neutral-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-200
                       flex flex-col items-center p-2"
            key={card.id}
          >
            <div className="flex w-full xl:h-48 items-center justify-center">
              <img
                src={`${basePath}/assets/cards_img/${card.image}`}
                className="w-full h-32 object-contain cursor-pointer rounded-lg hover:scale-105 transition-transform duration-200"
                onMouseEnter={() => onHover(card)}
                onClick={() => onCardClick(card)}
                alt={card.name}
              />
            </div>
            <div className="flex gap-2 w-full h-10 mt-2 justify-center">
              <button
                className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onAdd(card)}
                title="追加"
              >
                <PlusIcon className="w-5 h-5"/>
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onRemove(card)}
                title="削除"
              >
                <MinusIcon className="w-5 h-5"/>
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onAddToCandidate(card)}
                title="候補へ"
              >
                <ArrowLeftEndOnRectangleIcon className="w-5 h-5"/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardList;