import { PlusIcon, MinusIcon, ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';

function CardList({ cards, onAdd, onRemove, onHover, onAddToCandidate, onCardClick, basePath }) {
  return (
    <div className="
      flex max-w-full gap-2 overflow-x-auto
      md:grid
      md:grid-cols-[repeat(2,_8rem)] md:grid-rows-[content-fit] md:overflow-y-auto md:max-h-full
      lg:grid-cols-[repeat(3,_8rem)]"
    >
      {cards.map((card) => (
        <div key={card.id}>
          {/* カード画像 */}
          <div className="flex w-16 h-full items-center justify-center cursor-pointer">
            <img
              src={`${basePath}/assets/cards_img/${card.image}`}
              className="object-contain"
              onMouseEnter={() => onHover(card)}
              onClick={() => onCardClick(card)}
              alt={card.name}
            />
          </div>
            <div className="hidden flex gap-2 w-full h-10 mt-2 justify-center">
              <button
                className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onAdd(card)}
                title="追加"
              >
                <PlusIcon className="w-5 h-5"/>
              </button>
              <button
                className="hidden bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onRemove(card)}
                title="削除"
              >
                <MinusIcon className="w-5 h-5"/>
              </button>
              <button
                className="hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition-all duration-150 flex items-center justify-center"
                onClick={() => onAddToCandidate(card)}
                title="候補へ"
              >
                <ArrowLeftEndOnRectangleIcon className="w-5 h-5"/>
              </button>
            </div>
          </div>
        ))}
      </div>
  );
}

export default CardList;