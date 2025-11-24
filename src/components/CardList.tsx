import { PlusIcon, MinusIcon, ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import CardImage from './CardImage';
import type { Card } from '../types';

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
}

// HTMLImageElementの拡張（カスタムプロパティ用）
interface ExtendedHTMLImageElement extends HTMLImageElement {
  _touchStartY?: number;
  _touchStartX?: number;
  _touchStartTime?: number;
  _isVerticalSwipe?: boolean;
  _isHolding?: boolean;
  _isOverFolder?: boolean;
  _currentCard?: Card;
  _holdTimer?: number | null;
}

function CardList({ cards, onAdd, onAddMultiple, onRemove, onCardHover, onAddToCandidate, onRemoveFromCandidate, candidateFilter, onCardClick, basePath, showLifeBurst }: CardListProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto max-w-full py-3 flex-grow-1 mb-1"
      style={{ touchAction: 'pan-x' }}
    >
      {cards.map((card, index) => (
        <div key={`${card.id}-${index}`}>
          {/* カード */}
          <div className="flex w-16 h-full items-center justify-center cursor-pointer"
            // カード追加(フリック)
            onTouchStart={(e) => {
              const imgElement = e.currentTarget.querySelector('img') as ExtendedHTMLImageElement;
              const touch = e.touches[0];
              imgElement._touchStartY = touch.clientY;
              imgElement._touchStartX = touch.clientX;
              imgElement._touchStartTime = Date.now();
              imgElement._isVerticalSwipe = false;
              imgElement._isHolding = false;
              imgElement._isOverFolder = false;
              imgElement._currentCard = card;
              imgElement._holdTimer = null;
              imgElement.style.transition = 'none';
            }}
            onTouchMove={(e) => {
              const imgElement = e.currentTarget.querySelector('img') as ExtendedHTMLImageElement;

              // 既にホールド完了している場合は何もしない
              if (imgElement._isHolding) {
                return;
              }

              const startY = imgElement._touchStartY!;
              const startX = imgElement._touchStartX!;
              const currentY = e.touches[0].clientY;
              const currentX = e.touches[0].clientX;
              const deltaY = Math.abs(startY - currentY);
              const deltaX = Math.abs(startX - currentX);

              // フォルダボタン上にいるかチェック
              const touchedElement = document.elementFromPoint(currentX, currentY);
              const folderButton = document.getElementById('folder-button');
              const isOverFolder = folderButton && (touchedElement === folderButton || folderButton.contains(touchedElement));

              // フォルダボタンに入った時、まだホールドタイマーが設定されていなければ設定
              if (isOverFolder && !imgElement._holdTimer) {
                imgElement._isOverFolder = true;
                imgElement._holdTimer = window.setTimeout(() => {
                  if (imgElement._isOverFolder) {
                    imgElement._isHolding = true;
                    imgElement._isVerticalSwipe = false; // 縦スワイプをキャンセル

                    // フォルダフィルター有効時は削除、無効時は追加
                    if (candidateFilter) {
                      onRemoveFromCandidate(card);
                    } else {
                      onAddToCandidate(card);
                    }

                    // 視覚的フィードバック
                    if (folderButton) {
                      folderButton.style.transform = 'scale(1.1)';
                      setTimeout(() => {
                        folderButton.style.transform = 'scale(1)';
                      }, 200);
                    }
                  }
                }, 700);
              }

              // フォルダボタンから離れた時、タイマーをクリア
              if (!isOverFolder && imgElement._holdTimer) {
                clearTimeout(imgElement._holdTimer);
                imgElement._holdTimer = null;
                imgElement._isOverFolder = false;
              }

              // 縦方向の動きが横より大きい、かつ5px以上動いたら縦スワイプモード
              // ただし、フォルダボタン上にいる場合は縦スワイプ判定しない
              if (deltaY > deltaX && deltaY > 5 && !isOverFolder) {
                e.preventDefault(); // 横スクロールを防ぐ
                imgElement._isVerticalSwipe = true;

                // ホールドタイマーをクリア（スワイプ中は候補追加しない）
                if (imgElement._holdTimer) {
                  clearTimeout(imgElement._holdTimer);
                  imgElement._holdTimer = null;
                  imgElement._isOverFolder = false;
                }

                // カードを動かす（最大10pxまで）
                const signedDeltaY = startY - currentY;
                const translateY = Math.max(-10, Math.min(10, -signedDeltaY));
                imgElement.style.transform = `translateY(${translateY}px)`;
              }
            }}
            onTouchEnd={(e) => {
              const imgElement = e.currentTarget.querySelector('img') as ExtendedHTMLImageElement;
              const startY = imgElement._touchStartY!;
              const endY = e.changedTouches[0].clientY;
              const deltaY = startY - endY;

              // ホールドタイマーをクリア
              if (imgElement._holdTimer) {
                clearTimeout(imgElement._holdTimer);
                imgElement._holdTimer = null;
              }

              // アニメーション付きで元の位置に戻す
              imgElement.style.transition = 'transform 0.2s ease-out';
              imgElement.style.transform = 'translateY(0)';

              // ホールドで候補追加された場合はスワイプ処理をスキップ
              if (imgElement._isHolding) {
                imgElement._isHolding = false;
                imgElement._isOverFolder = false;
                return;
              }

              if (imgElement._isVerticalSwipe) {
                if (deltaY > 30) {
                  // 上スワイプ → 1枚追加
                  onAdd(card);
                } else if (deltaY < -30) {
                  // 下スワイプ → 4枚追加（構築制限チェックしながら1枚ずつ、最後に1回だけソート）
                  onAddMultiple(card, 4);
                }
              }
            }}
          >
            <CardImage
              card={card}
              src={`${basePath}/assets/cards_img/${card.image}`}
              className="object-contain"
              alt={card.name}
              showLifeBurst={showLifeBurst}
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
  );
}

export default CardList;
