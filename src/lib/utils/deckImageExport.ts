import type { Card } from '$lib/types';
import { cardImageUrl } from '$lib/utils/cardImages';

interface CardStack {
  card: Card;
  count: number;
}

export function groupMainDeckCards(mainDeck: Card[]): CardStack[] {
  const cardMap = new Map<string, CardStack>();
  mainDeck.forEach(card => {
    const id = card.cardID || card.image;
    if (cardMap.has(id)) cardMap.get(id)!.count++;
    else cardMap.set(id, { card, count: 1 });
  });
  return Array.from(cardMap.values());
}

export function getCenterLrig(lrigDeck: Card[]): Card | null {
  const lrigs = lrigDeck.filter(card => card.cardType?.[0] === 'ルリグ');
  if (lrigs.length === 0) return null;
  return lrigs.reduce((max, card) => (card.level ?? 0) > (max.level ?? 0) ? card : max, lrigs[0]);
}

export function getOtherLrigCards(lrigDeck: Card[], centerLrig: Card | null): Card[] {
  if (!centerLrig) return lrigDeck;
  return lrigDeck.filter(card => card.cardID !== centerLrig.cardID || card.image !== centerLrig.image);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateStackDeckImage(
  deckName: string, mainDeck: Card[], lrigDeck: Card[]
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const width = 1920, height = 1080;
  canvas.width = width; canvas.height = height;
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, width, height);

  const headerHeight = 80;
  ctx.fillStyle = '#27272a';
  ctx.fillRect(0, 0, width, headerHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(deckName || '無題のデッキ', 40, headerHeight / 2);

  const cardWidth = 120, cardHeight = 168, margin = 10, startY = headerHeight + 20;
  const lrigStartX = 20;
  const centerLrig = getCenterLrig(lrigDeck);
  const otherLrigCards = getOtherLrigCards(lrigDeck, centerLrig);

  const imageLoadPromises: Promise<{ img: HTMLImageElement; x: number; y: number; isStack?: boolean; count?: number } | null>[] = [];

  if (centerLrig) {
    const x = lrigStartX + cardWidth + margin;
    const y = startY;
    imageLoadPromises.push(
      loadImage(cardImageUrl(centerLrig.image)).then(img => ({ img, x, y })).catch(() => null)
    );
  }

  let lrigX = lrigStartX, lrigY = startY + cardHeight + margin, lrigCol = 0;
  for (const card of otherLrigCards) {
    const x = lrigX, y = lrigY;
    imageLoadPromises.push(
      loadImage(cardImageUrl(card.image)).then(img => ({ img, x, y })).catch(() => null)
    );
    lrigCol++;
    if (lrigCol >= 4) { lrigCol = 0; lrigX = lrigStartX; lrigY += cardHeight + margin; }
    else lrigX += cardWidth + margin;
  }

  const mainStartX = lrigStartX + (cardWidth + margin) * 4 + 40;
  const cardStacks = groupMainDeckCards(mainDeck);
  let mainX = mainStartX, mainY = startY, mainRow = 0;

  for (const stack of cardStacks) {
    const x = mainX, y = mainY;
    imageLoadPromises.push(
      loadImage(cardImageUrl(stack.card.image)).then(img => ({
        img, x, y, isStack: true, count: stack.count
      })).catch(() => null)
    );
    mainRow++;
    if (mainRow >= 3) { mainRow = 0; mainX += cardWidth + margin; mainY = startY; }
    else mainY += cardHeight + margin;
  }

  const loadedImages = await Promise.all(imageLoadPromises);
  for (const item of loadedImages) {
    if (!item) continue;
    ctx.drawImage(item.img, item.x, item.y, cardWidth, cardHeight);
    if (item.isStack && item.count) {
      const countBgHeight = 28, countBgY = item.y + cardHeight - countBgHeight;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(item.x, countBgY, cardWidth, countBgHeight);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`×${item.count}`, item.x + cardWidth / 2, countBgY + countBgHeight / 2);
    }
  }
  return canvas;
}

export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpg' = 'png') {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, mimeType);
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async blob => {
      if (!blob) { reject(new Error('Failed to create blob')); return; }
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        resolve();
      } catch (error) { reject(error); }
    }, 'image/png');
  });
}
