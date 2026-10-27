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
  columns?: number;
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
    pageBg: '#18181b',
    boxFill: 'rgba(82, 82, 91, 0.10)',
    boxStroke: 'rgba(75, 85, 99, 0.30)',
    deckName: '#ffffff',
    title: '#e4e4e7',
    muted: '#9ca3af',
    placeholderFill: '#27272a',
    placeholderStroke: 'rgba(120, 120, 130, 0.4)',
  },
  light: {
    pageBg: '#e4e4e7',
    boxFill: 'rgba(255, 255, 255, 0.55)',
    boxStroke: 'rgba(63, 63, 70, 0.18)',
    deckName: '#18181b',
    title: '#27272a',
    muted: '#71717a',
    placeholderFill: '#d4d4d8',
    placeholderStroke: 'rgba(82, 82, 91, 0.35)',
  },
};

export async function generateDeckImage(
  deckName: string,
  mainDeck: Card[],
  lrigDeck: Card[],
  options: DeckImageOptions = {},
): Promise<HTMLCanvasElement> {
  const { rotateLandscape = false, columns = 8, theme = 'dark' } = options;
  const pal = PALETTES[theme];
  const WIDTH = 1600;
  const COLS = columns;
  const GAP = 8;
  const PAD = 28;
  const BOX_PAD = 20;
  const HEADER_H = 100;
  const BOX_TITLE_H = 64;
  const SECTION_GAP = 16;
  const RADIUS = 16;

  const gridW = WIDTH - PAD * 2 - BOX_PAD * 2;
  const CARD_W = Math.floor((gridW - (COLS - 1) * GAP) / COLS);
  const CARD_H = Math.round((CARD_W * 17) / 12);

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

  const family = '"Zen Maru Gothic", sans-serif';
  try {
    await Promise.all([
      document.fonts.load(`700 56px "Zen Maru Gothic"`, `${deckName}Lrig DeckMain Deck`),
      document.fonts.load(`400 32px "Zen Maru Gothic"`, 'LB0123456789'),
    ]);
    await document.fonts.ready;
  } catch {}

  ctx.fillStyle = pal.pageBg;
  ctx.fillRect(0, 0, width, height);

  const headerMid = PAD + HEADER_H / 2;

  ctx.fillStyle = pal.deckName;
  ctx.font = `bold 56px ${family}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(deckName || '無題のデッキ', PAD, headerMid);

  const LOGO_H = 56;
  try {
    const logo = await loadImage('/wixdex.png');
    const scale = LOGO_H / logo.naturalHeight;
    const lw = logo.naturalWidth * scale;
    ctx.drawImage(logo, width - PAD - lw, headerMid - LOGO_H / 2, lw, LOGO_H);
  } catch {}

  const drawBox = (x: number, y: number, w: number, h: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, RADIUS);
    ctx.fillStyle = pal.boxFill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = pal.boxStroke;
    ctx.stroke();
  };

  const drawTitle = (label: string, boxY: number, lb?: number) => {
    const ty = boxY + BOX_PAD;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = `bold 40px ${family}`;
    ctx.fillStyle = pal.title;
    ctx.fillText(label, PAD + BOX_PAD, ty);
    if (lb !== undefined) {
      ctx.font = `32px ${family}`;
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
        drawContain(ctx, img, s.x, s.y, CARD_W, CARD_H);
      }
    } else {
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
