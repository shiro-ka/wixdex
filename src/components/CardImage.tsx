import { useState } from 'react';
import LazyImage from './LazyImage';
import { LifeBurstIcon } from './icons/LifeBurstIcon';
import type { Card } from '../types';

interface CardImageProps {
  card: Card;
  src: string;
  alt: string;
  className?: string;
  showLifeBurst?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  onTouchStart?: (e: React.TouchEvent<HTMLImageElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLImageElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLImageElement>) => void;
}

function CardImage({
  card,
  src,
  alt,
  className = '',
  showLifeBurst = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: CardImageProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const hasLifeBurst = card.lifeBurst === 'true';

  return (
    <div className="relative inline-block">
      <LazyImage
        src={src}
        alt={alt}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onLoad={setIsImageLoaded}
      />
      {showLifeBurst && hasLifeBurst && isImageLoaded && (
        <div className="absolute bottom-1 right-1 bg-orange-500 rounded-full p-0.5 shadow-lg">
          <LifeBurstIcon className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}

export default CardImage;
