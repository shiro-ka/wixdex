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

export type DeckImageTheme = 'dark' | 'light';

export interface DeckImageOptions {
  rotateLandscape?: boolean;
  /** 横の列数。8列(メイン5行) or 10列(メイン4行)。 */
  columns?: number;
  /** 配色。light は完全な白を避けたグレー寄りの淡色（白ロゴが同化しないように）。 */
  theme?: DeckImageTheme;
}

interface Palette {
  pageBg: string;
  boxFill: string;
  boxStroke: string;
  deckName: string;
  title: string;
  muted: string;
  placeholderFill: string;
  placeholderStroke: string;
}

const PALETTES: Record<DeckImageTheme, Palette> = {
  dark: {
    pageBg: '#18181b', // zinc-900（アプリ本体と同じ）
    boxFill: 'rgba(82, 82, 91, 0.10)',
    boxStroke: 'rgba(75, 85, 99, 0.30)',
    deckName: '#ffffff',
    title: '#e4e4e7',
    muted: '#9ca3af',
    placeholderFill: '#27272a',
    placeholderStroke: 'rgba(120, 120, 130, 0.4)',
  },
  light: {
    pageBg: '#e4e4e7', // zinc-200。完全な白は避ける（白ロゴが同化＆野暮ったいため）
    boxFill: 'rgba(255, 255, 255, 0.55)',
    boxStroke: 'rgba(63, 63, 70, 0.18)',
    deckName: '#18181b',
    title: '#27272a',
    muted: '#71717a',
    placeholderFill: '#d4d4d8',
    placeholderStroke: 'rgba(82, 82, 91, 0.35)',
  },
};

/**
 * アプリ本体と同じ見た目のデッキ画像を生成する。
 * ヘッダ（左=デッキ名 / 右=wixdexロゴ）＋ ルリグ/メインを zinc ハコに入れた縦長レイアウト。
 * スタック表示はせず、渡された配列順（＝アプリ表示と同じソート済み順）でそのまま並べる。
 * 横幅は固定(1600px)で、列数とテーマを options で切り替えられる。
 */
export async function generateDeckImage(
  deckName: string,
  mainDeck: Card[],
  lrigDeck: Card[],
  options: DeckImageOptions = {},
): Promise<HTMLCanvasElement> {
  const { rotateLandscape = false, columns = 8, theme = 'dark' } = options;
  const pal = PALETTES[theme];
  const WIDTH = 1600; // 出力幅は固定。高さだけデッキ枚数で動的に伸びる。
  const COLS = columns;
  const GAP = 8;
  const PAD = 28; // 画像外周の余白
  const BOX_PAD = 20; // ハコ内側の余白
  const HEADER_H = 100; // デッキ名 + ロゴ
  const BOX_TITLE_H = 64; // ハコ内のセクション見出し領域
  const SECTION_GAP = 16; // ルリグハコ↔メインハコの間
  const RADIUS = 16; // ハコ角丸（rounded-xl 相当）

  // 固定幅からカード1枚の幅を逆算する（WIDTH=1600 は COLS=8 で割り切れて端数が出ない）。
  const gridW = WIDTH - PAD * 2 - BOX_PAD * 2;
  const CARD_W = Math.floor((gridW - (COLS - 1) * GAP) / COLS);
  const CARD_H = Math.round((CARD_W * 17) / 12); // カード比 12:17

  const lrigRows = Math.max(1, Math.ceil(lrigDeck.length / COLS));
  const mainRows = Math.max(1, Math.ceil(mainDeck.length / COLS));
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

  // 背景
  ctx.fillStyle = pal.pageBg;
  ctx.fillRect(0, 0, width, height);

  const headerMid = PAD + HEADER_H / 2;

  // ヘッダ左: デッキ名
  ctx.fillStyle = pal.deckName;
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(deckName || '無題のデッキ', PAD, headerMid);

  // ヘッダ右: wixdex ファビコンを控えめに
  const LOGO_H = 56;
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
    ctx.fillStyle = pal.boxFill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = pal.boxStroke;
    ctx.stroke();
  };

  // ハコ内のセクション見出し（左=ラベル / 任意で右=LB数）。枚数は見れば分かるので出さない。
  const drawTitle = (label: string, boxY: number, lb?: number) => {
    const ty = boxY + BOX_PAD;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = pal.title;
    ctx.fillText(label, PAD + BOX_PAD, ty);
    if (lb !== undefined) {
      ctx.font = '32px sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'right';
      ctx.fillText(`LB ${lb}`, PAD + boxW - BOX_PAD, ty + 8);
    }
  };

  const lrigBoxY = PAD + HEADER_H;
  const mainBoxY = lrigBoxY + lrigBoxH + SECTION_GAP;
  const lbCount = mainDeck.filter((c) => c.lifeBurst === true).length;

  drawBox(PAD, lrigBoxY, boxW, lrigBoxH);
  drawBox(PAD, mainBoxY, boxW, mainBoxH);
  drawTitle('Lrig Deck', lrigBoxY);
  drawTitle('Main Deck', mainBoxY, lbCount);

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
      ctx.fillStyle = pal.placeholderFill;
      ctx.fillRect(s.x, s.y, CARD_W, CARD_H);
      ctx.strokeStyle = pal.placeholderStroke;
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
