/**
 * カードの升目の指の操作を読み取る。
 *
 * ★ここは「何が起きたか」しか知らない。上へ払ったら onSwipeUp、下へ払ったら
 *   onSwipeDown、フォルダの上で押さえ続けたら onHold ―― それがデッキへの追加なのか
 *   候補への出し入れなのかは呼ぶ側が決める。判定の中に業務の意味を入れない。
 *
 * 指の追従（画像を少し動かす）はここで直接 style を書く。Svelte の状態にすると
 * 升目ごとに再描画が走り、一覧をなぞるだけで重くなる。
 */

/** フォルダの上で押さえ続けたと見なすまでの時間 */
const HOLD_MS = 700;
/** 払ったと見なす縦の移動量 */
const SWIPE_PX = 30;
/** 指に追従させる画像の振れ幅 */
const DRAG_CLAMP_PX = 10;
/** 縦の操作だと決める最小の移動量（横スクロールと食い合わないように） */
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
  /** 上へ払った */
  onSwipeUp: (item: T) => void;
  /** 下へ払った */
  onSwipeDown: (item: T) => void;
  /** フォルダの上で押さえ続けた */
  onHold: (item: T) => void;
  /** 押さえ続けた先の目印。見つからなければ押さえの判定をしない */
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
            // 受け取ったことを一瞬の膨らみで返す
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

      // 押さえて離したときは払いとして扱わない
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
