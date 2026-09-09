/**
 * 画像の上で下向きにスワイプしたときの引っぱり更新を止める。
 *
 * カードは画像を掴んで動かす操作（デッキへ入れる等）を持つので、
 * 画面の一番上で下へ引くと更新と競合する。画像に触れているときだけ抑える。
 *
 * 戻り値は後始末。onMount からそのまま返せる。
 */
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
