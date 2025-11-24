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
  showCandidateIcon?: boolean;
  isInCandidates?: boolean;
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
  showCandidateIcon = false,
  isInCandidates = false,
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
      {showCandidateIcon && isInCandidates && isImageLoaded && (
        <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
            <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default CardImage;
