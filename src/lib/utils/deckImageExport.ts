import type { Card } from '$lib/types';
import { cardImageUrl } from '$lib/utils/cardImages';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** スロット(x,y,W,H)内に画像をアスペクト維持で収める（object-contain 相当・引き伸ばさない）。 */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  W: number,
  H: number,
) {
  const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (W - dw) / 2, y + (H - dh) / 2, dw, dh);
}

/** 横向き画像を90°回転し、縦スロットにアスペクト維持で収める（アプリの rotateLandscape 相当）。 */
function drawRotatedContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  W: number,
  H: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  // 回転後は幅↔高さが入れ替わるので、収まり判定もそれに合わせる。
  const scale = Math.min(W / ih, H / iw);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.save();
  ctx.translate(x + W / 2, y + H / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

/**
 * デッキリスト欄と同じ「8列 × ルリグ1行＋メイン5行」のデッキ画像を生成する。
 * スタック表示はせず、渡された配列順（＝アプリ表示と同じソート済み順）でそのまま並べる。
 * グリッドが固定なので出力比率もほぼ固定（標準デッキで約 1616×1772 ≒ ほぼ1:1）。
 */
export async function generateDeckImage(
  deckName: string,
  mainDeck: Card[],
  lrigDeck: Card[],
  rotateLandscape = false,
): Promise<HTMLCanvasElement> {
  const COLS = 8;
  const CARD_W = 188;
  const CARD_H = Math.round((CARD_W * 17) / 12); // カード比 12:17
  const GAP = 8;
  const PAD = 28;
  const HEADER_H = 72; // デッキ名
  const SECTION_GAP = 16; // ルリグ↔メインの間

  const lrigRows = Math.max(1, Math.ceil(lrigDeck.length / COLS));
  const mainRows = Math.max(1, Math.ceil(mainDeck.length / COLS));
  const gridW = COLS * CARD_W + (COLS - 1) * GAP;
  const lrigGridH = lrigRows * CARD_H + (lrigRows - 1) * GAP;
  const mainGridH = mainRows * CARD_H + (mainRows - 1) * GAP;

  const width = PAD * 2 + gridW;
  const height = PAD + HEADER_H + lrigGridH + SECTION_GAP + mainGridH + PAD;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // 背景（アプリと同じ zinc-900）
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, width, height);

  // ヘッダ: デッキ名
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(deckName || '無題のデッキ', PAD, PAD + HEADER_H / 2);

  const lrigTop = PAD + HEADER_H;
  const mainTop = lrigTop + lrigGridH + SECTION_GAP;

  interface Slot {
    card: Card;
    x: number;
    y: number;
  }
  const slots: Slot[] = [];
  const place = (cards: Card[], top: number) => {
    cards.forEach((card, i) => {
      slots.push({
        card,
        x: PAD + (i % COLS) * (CARD_W + GAP),
        y: top + Math.floor(i / COLS) * (CARD_H + GAP),
      });
    });
  };
  place(lrigDeck, lrigTop);
  place(mainDeck, mainTop);

  // 画像を並列ロード（失敗は null）してから順に描画
  const loaded = await Promise.all(
    slots.map((s) =>
      loadImage(cardImageUrl(s.card.image))
        .then((img) => ({ s, img }))
        .catch(() => ({ s, img: null as HTMLImageElement | null })),
    ),
  );

  for (const { s, img } of loaded) {
    if (img) {
      const landscape = img.naturalWidth > img.naturalHeight;
      if (rotateLandscape && landscape) {
        drawRotatedContain(ctx, img, s.x, s.y, CARD_W, CARD_H);
      } else {
        // 縦長はスロットを埋め、横長は引き伸ばさず横のまま収める（レターボックス）
        drawContain(ctx, img, s.x, s.y, CARD_W, CARD_H);
      }
    } else {
      // ロード失敗時は欠けが分かるようプレースホルダを描く
      ctx.fillStyle = '#27272a';
      ctx.fillRect(s.x, s.y, CARD_W, CARD_H);
      ctx.strokeStyle = 'rgba(120,120,130,0.4)';
      ctx.strokeRect(s.x + 0.5, s.y + 0.5, CARD_W - 1, CARD_H - 1);
    }
  }

  return canvas;
}

export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'jpg' = 'png',
) {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, mimeType);
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob'));
        return;
      }
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        resolve();
      } catch (error) {
        reject(error);
      }
    }, 'image/png');
  });
}
