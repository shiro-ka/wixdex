import CardImage from './CardImage';
import type { Card } from '../types';
import { useCardSwipe } from '../hooks/useCardSwipe';

interface CardListProps {
  cards: Card[];
  onAdd: (card: Card) => void;
  onAddMultiple: (card: Card, count: number) => void;
  onRemove: (card: Card) => void;
  onCardHover: (card: Card | null) => void;
  onAddToCandidate: (card: Card) => void;
  onRemoveFromCandidate: (card: Card) => void;
  candidateFilter: boolean;
  onCardClick: (card: Card) => void;
  basePath: string;
  showLifeBurst: boolean;
  showCandidateIcon: boolean;
  candidateCards: Card[];
}

function CardList({ cards, onAdd, onAddMultiple, onCardHover, onAddToCandidate, onRemoveFromCandidate, candidateFilter, onCardClick, basePath, showLifeBurst, showCandidateIcon, candidateCards }: CardListProps) {
  // カードスワイプ処理
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useCardSwipe({
    onAdd,
    onAddMultiple,
    onAddToCandidate,
    onRemoveFromCandidate,
    candidateFilter,
  });

  // カードが候補カードに含まれているかチェック
  const isCardInCandidates = (card: Card): boolean => {
    return candidateCards.some(c => (c.id && c.id === card.id) || (c.image === card.image));
  };

  return (
    <div
      className="flex flex-1 gap-2 max-w-full py-3 mb-1 overflow-x-auto md:grid md:grid-cols-3 md:auto-rows-min md:px-2 md:rounded-xl md:border-1 md:border-gray-600/50 md:overflow-y-auto md:overflow-x-hidden"
      style={{ touchAction: 'pan-x' }}
    >
      {cards.map((card, index) => (
        <div key={`${card.id}-${index}`}>
          <div
            className="flex flex-col items-center justify-center w-16 h-full cursor-pointer md:w-full"
            onTouchStart={(e) => handleTouchStart(e, card)}
            onTouchMove={(e) => handleTouchMove(e, card)}
            onTouchEnd={(e) => handleTouchEnd(e, card)}
          >
            <div className="hidden md:flex items-center w-full aspect-[3/4]">
              <CardImage
                card={card}
                src={`${basePath}/assets/cards_img/${card.image}`}
                className="object-contain"
                alt={card.name}
                showLifeBurst={showLifeBurst}
                showCandidateIcon={showCandidateIcon}
                isInCandidates={isCardInCandidates(card)}
                onMouseEnter={() => onCardHover(card)}
                onClick={() => onCardClick(card)}
              />
            </div>
            <CardImage
              card={card}
              src={`${basePath}/assets/cards_img/${card.image}`}
              className="object-contain md:hidden"
              alt={card.name}
              showLifeBurst={showLifeBurst}
              showCandidateIcon={showCandidateIcon}
              isInCandidates={isCardInCandidates(card)}
              onMouseEnter={() => onCardHover(card)}
              onClick={() => onCardClick(card)}
            />
            <div className="hidden md:flex justify-center gap-2 w-full h-8">
              <button
                className="flex flex-1 items-center justify-center p-0 rounded-lg bg-zinc-600/10 hover:bg-zinc-500/30 border border-gray-600/50 transition-all"
                onClick={() => onAdd(card)}
                title="デッキに1枚追加"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 5l0 14" />
                  <path d="M5 12l14 0" />
                </svg>
              </button>
              <button
                className="flex flex-1 items-center justify-center p-0 rounded-lg bg-zinc-600/10 hover:bg-zinc-500/30 border border-gray-600/50 transition-all"
                onClick={() => onAddMultiple(card, 4)}
                title="デッキに4枚追加"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M15 20v-15l-8 11h10" />
                </svg>
              </button>
              <button
                className="flex flex-1 items-center justify-center p-0 rounded-lg bg-zinc-600/10 hover:bg-zinc-500/30 border border-gray-600/50 transition-all"
                onClick={() => {
                  if (candidateFilter) {
                    onRemoveFromCandidate(card);
                  } else {
                    onAddToCandidate(card);
                  }
                }}
                title={candidateFilter ? "候補カードから削除" : "候補カードに追加"}
              >
                {candidateFilter ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M13.5 19h-8.5a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v4" />
                    <path d="M22 22l-5 -5" />
                    <path d="M17 22l5 -5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v3.5" />
                    <path d="M16 19h6" />
                    <path d="M19 16v6" />
                  </svg>
                )}
              </button>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}

export default CardList;
