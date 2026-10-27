export function preventPullToRefresh(): () => void {
  let startY = 0;
  let touched: EventTarget | null = null;

  const onTouchStart = (e: TouchEvent) => {
    startY = e.touches[0].clientY;
    touched = e.target;
  };
  const onTouchMove = (e: TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY;
    const el = touched as HTMLElement | null;
    const isImg = el?.closest?.('img') || el?.tagName === 'IMG';
    if (deltaY > 0 && window.scrollY === 0 && isImg) e.preventDefault();
  };

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
  };
}
