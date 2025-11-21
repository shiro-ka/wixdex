import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onMouseEnter?: () => void;
  onClick?: () => void;
}

function LazyImage({ src, alt, className, onMouseEnter, onClick }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement | HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <>
      {isInView ? (
        <img
          ref={imgRef as React.RefObject<HTMLImageElement>}
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onMouseEnter={onMouseEnter}
          onClick={onClick}
        />
      ) : (
        <div ref={imgRef as React.RefObject<HTMLDivElement>} className={`${className} bg-gray-700/20 animate-pulse`} />
      )}
    </>
  );
}

export default LazyImage;
