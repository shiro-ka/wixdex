const HOLD_MS = 700;
const SWIPE_PX = 30;
const DRAG_CLAMP_PX = 10;
const DIRECTION_PX = 5;

interface GestureState {
  startY: number;
  startX: number;
  isVerticalSwipe: boolean;
  isHolding: boolean;
  isOverFolder: boolean;
  holdTimer: ReturnType<typeof setTimeout> | null;
}

export interface CardGestureHandlers<T> {
  start: (e: TouchEvent, item: T) => void;
  move: (e: TouchEvent, item: T) => void;
  end: (e: TouchEvent, item: T) => void;
}

export function createCardGestures<T>(opts: {
  onSwipeUp: (item: T) => void;
  onSwipeDown: (item: T) => void;
  onHold: (item: T) => void;
  folderId: string;
}): CardGestureHandlers<T> {
  const states = new Map<HTMLElement, GestureState>();
  const imgOf = (node: HTMLElement) => node.querySelector('img');

  const clearHold = (s: GestureState) => {
    if (s.holdTimer) clearTimeout(s.holdTimer);
    s.holdTimer = null;
    s.isOverFolder = false;
  };

  return {
    start(e, _item) {
      const node = e.currentTarget as HTMLElement;
      const touch = e.touches[0];
      states.set(node, {
        startY: touch.clientY,
        startX: touch.clientX,
        isVerticalSwipe: false,
        isHolding: false,
        isOverFolder: false,
        holdTimer: null,
      });
      const img = imgOf(node);
      if (img) img.style.transition = 'none';
    },

    move(e, item) {
      const node = e.currentTarget as HTMLElement;
      const s = states.get(node);
      if (!s || s.isHolding) return;

      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      const dy = Math.abs(s.startY - y);
      const dx = Math.abs(s.startX - x);

      const under = document.elementFromPoint(x, y);
      const folder = document.getElementById(opts.folderId);
      const overFolder = !!folder && (under === folder || folder.contains(under));

      if (overFolder && !s.holdTimer) {
        s.isOverFolder = true;
        s.holdTimer = setTimeout(() => {
          if (!s.isOverFolder) return;
          s.isHolding = true;
          s.isVerticalSwipe = false;
          opts.onHold(item);
          if (folder) {
            folder.style.transform = 'scale(1.1)';
            setTimeout(() => {
              folder.style.transform = 'scale(1)';
            }, 200);
          }
        }, HOLD_MS);
      }

      if (!overFolder && s.holdTimer) clearHold(s);

      if (dy > dx && dy > DIRECTION_PX && !overFolder) {
        e.preventDefault();
        s.isVerticalSwipe = true;
        clearHold(s);
        const img = imgOf(node);
        if (img) {
          const shift = Math.max(-DRAG_CLAMP_PX, Math.min(DRAG_CLAMP_PX, y - s.startY));
          img.style.transform = `translateY(${shift}px)`;
        }
      }
    },

    end(e, item) {
      const node = e.currentTarget as HTMLElement;
      const s = states.get(node);
      if (!s) return;
      clearHold(s);

      const img = imgOf(node);
      if (img) {
        img.style.transition = 'transform 0.2s ease-out';
        img.style.transform = 'translateY(0)';
      }

      if (s.isHolding) {
        states.delete(node);
        return;
      }

      if (s.isVerticalSwipe) {
        const up = s.startY - e.changedTouches[0].clientY;
        if (up > SWIPE_PX) opts.onSwipeUp(item);
        else if (up < -SWIPE_PX) opts.onSwipeDown(item);
      }
      states.delete(node);
    },
  };
}
