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
 * アプリ本体と同じ見た目のデッキ画像を生成する。
 * ヘッダ（左=デッキ名 / 右=wixdexロゴ）＋ ルリグ/メインを zinc ハコに入れた縦長レイアウト。
 * スタック表示はせず、渡された配列順（＝アプリ表示と同じソート済み順）でそのまま並べる。
 * グリッドが固定なので出力比率もほぼ固定。
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
  const PAD = 28; // 画像外周の余白
  const HEADER_H = 84; // デッキ名 + ロゴ
  const BOX_PAD = 20; // ハコ内側の余白
  const BOX_TITLE_H = 46; // ハコ内のセクション見出し領域
  const SECTION_GAP = 16; // ルリグハコ↔メインハコの間
  const RADIUS = 16; // ハコ角丸（rounded-xl 相当）

  const lrigRows = Math.max(1, Math.ceil(lrigDeck.length / COLS));
  const mainRows = Math.max(1, Math.ceil(mainDeck.length / COLS));
  const gridW = COLS * CARD_W + (COLS - 1) * GAP;
  const lrigGridH = lrigRows * CARD_H + (lrigRows - 1) * GAP;
  const mainGridH = mainRows * CARD_H + (mainRows - 1) * GAP;

  const boxW = gridW + BOX_PAD * 2;
  const lrigBoxH = BOX_PAD + BOX_TITLE_H + lrigGridH + BOX_PAD;
  const mainBoxH = BOX_PAD + BOX_TITLE_H + mainGridH + BOX_PAD;

  const width = PAD * 2 + boxW;
  const height = PAD + HEADER_H + lrigBoxH + SECTION_GAP + mainBoxH + PAD;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // 背景（アプリと同じ zinc-900）
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, width, height);

  const headerMid = PAD + HEADER_H / 2;

  // ヘッダ左: デッキ名
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(deckName || '無題のデッキ', PAD, headerMid);

  // ヘッダ右: wixdex ファビコンを控えめに（小さめ＋わずかに透過）
  const LOGO_H = 44;
  try {
    const logo = await loadImage('/wixdex.png');
    const scale = LOGO_H / logo.naturalHeight;
    const lw = logo.naturalWidth * scale;
    ctx.drawImage(logo, width - PAD - lw, headerMid - LOGO_H / 2, lw, LOGO_H);
  } catch {
    // ロゴが読めなければ何も描かない（出力自体は続行）
  }

  // ハコ（rounded-xl / bg-zinc-600/10 / border-gray-600/30 相当）を描く
  const drawBox = (x: number, y: number, w: number, h: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, RADIUS);
    ctx.fillStyle = 'rgba(82, 82, 91, 0.10)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.30)';
    ctx.stroke();
  };

  // ハコ内のセクション見出し（左=ラベル+枚数 / 任意で右=LB数）
  const drawTitle = (label: string, count: number, boxY: number, lb?: number) => {
    const ty = boxY + BOX_PAD;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#e4e4e7';
    ctx.fillText(label, PAD + BOX_PAD, ty);
    const lw = ctx.measureText(label).width;
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`(${count})`, PAD + BOX_PAD + lw + 10, ty + 4);
    if (lb !== undefined) {
      ctx.textAlign = 'right';
      ctx.fillText(`LB ${lb}`, PAD + boxW - BOX_PAD, ty + 4);
    }
  };

  const lrigBoxY = PAD + HEADER_H;
  const mainBoxY = lrigBoxY + lrigBoxH + SECTION_GAP;
  const lbCount = mainDeck.filter((c) => c.lifeBurst === true).length;

  drawBox(PAD, lrigBoxY, boxW, lrigBoxH);
  drawBox(PAD, mainBoxY, boxW, mainBoxH);
  drawTitle('Lrig Deck', lrigDeck.length, lrigBoxY);
  drawTitle('Main Deck', mainDeck.length, mainBoxY, lbCount);

  const lrigTop = lrigBoxY + BOX_PAD + BOX_TITLE_H;
  const mainTop = mainBoxY + BOX_PAD + BOX_TITLE_H;

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
        x: PAD + BOX_PAD + (i % COLS) * (CARD_W + GAP),
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
