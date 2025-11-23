import type { Card } from '../types';

interface CardStack {
  card: Card;
  count: number;
}

// メインデッキのカードをスタック形式にグループ化
export function groupMainDeckCards(mainDeck: Card[]): CardStack[] {
  const cardMap = new Map<string, CardStack>();

  mainDeck.forEach(card => {
    const id = card.id || card.image;
    if (cardMap.has(id)) {
      cardMap.get(id)!.count++;
    } else {
      cardMap.set(id, { card, count: 1 });
    }
  });

  return Array.from(cardMap.values());
}

// センタールリグを取得
export function getCenterLrig(lrigDeck: Card[]): Card | null {
  // レベルが最も高いルリグを取得
  const lrigs = lrigDeck.filter(card => card.cardType?.[0] === 'ルリグ');
  if (lrigs.length === 0) return null;

  return lrigs.reduce((max, card) => {
    return card.level > max.level ? card : max;
  }, lrigs[0]);
}

// センタールリグ以外のルリグデッキカードを取得
export function getOtherLrigCards(lrigDeck: Card[], centerLrig: Card | null): Card[] {
  if (!centerLrig) return lrigDeck;
  return lrigDeck.filter(card => card.id !== centerLrig.id || card.image !== centerLrig.image);
}

// カード画像を読み込む
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// スタック式デッキ画像を生成
export async function generateStackDeckImage(
  deckName: string,
  mainDeck: Card[],
  lrigDeck: Card[],
  basePath: string
): Promise<HTMLCanvasElement> {
  console.log('[generateStackDeckImage] Start', { deckName, mainDeckCount: mainDeck.length, lrigDeckCount: lrigDeck.length });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // 16:9のサイズ
  const width = 1920;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;
  console.log('[generateStackDeckImage] Canvas created', { width, height });

  // 背景
  ctx.fillStyle = '#18181b'; // zinc-900
  ctx.fillRect(0, 0, width, height);
  console.log('[generateStackDeckImage] Background drawn');

  // ヘッダー（デッキ名）
  const headerHeight = 80;
  ctx.fillStyle = '#27272a'; // zinc-800
  ctx.fillRect(0, 0, width, headerHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(deckName || '無題のデッキ', 40, headerHeight / 2);
  console.log('[generateStackDeckImage] Header drawn', { deckName });

  // カードサイズとマージン
  const cardWidth = 120;
  const cardHeight = 168;
  const margin = 10;
  const startY = headerHeight + 20;

  // ルリグデッキエリア（左側）
  const lrigStartX = 20;
  const centerLrig = getCenterLrig(lrigDeck);
  const otherLrigCards = getOtherLrigCards(lrigDeck, centerLrig);
  console.log('[generateStackDeckImage] Lrig deck processing', { centerLrig: centerLrig?.name, otherCount: otherLrigCards.length });

  // 全ての画像を事前にロード
  const imageLoadPromises: Promise<{ img: HTMLImageElement; x: number; y: number; isStack?: boolean; count?: number } | null>[] = [];

  // センタールリグを描画（1段目、中央）
  if (centerLrig) {
    const x = lrigStartX + cardWidth + margin; // 2列目に配置
    const y = startY;
    const imgPath = `${basePath}/assets/cards_img/${centerLrig.image}`;
    console.log('[generateStackDeckImage] Loading center lrig', imgPath);
    imageLoadPromises.push(
      loadImage(imgPath).then(img => ({ img, x, y })).catch(error => {
        console.error('Failed to load center lrig image:', error);
        return null;
      })
    );
  }

  // その他のルリグデッキカード（2段目、3段目）
  let lrigX = lrigStartX;
  let lrigY = startY + cardHeight + margin;
  let lrigCol = 0;

  for (const card of otherLrigCards) {
    const x = lrigX;
    const y = lrigY;
    imageLoadPromises.push(
      loadImage(`${basePath}/assets/cards_img/${card.image}`).then(img => ({ img, x, y })).catch(error => {
        console.error('Failed to load lrig card image:', error);
        return null;
      })
    );

    lrigCol++;
    if (lrigCol >= 4) {
      lrigCol = 0;
      lrigX = lrigStartX;
      lrigY += cardHeight + margin;
    } else {
      lrigX += cardWidth + margin;
    }
  }

  // メインデッキエリア（右側、スタック表示）
  const mainStartX = lrigStartX + (cardWidth + margin) * 4 + 40;
  const cardStacks = groupMainDeckCards(mainDeck);

  let mainX = mainStartX;
  let mainY = startY;
  let mainRow = 0;
  const maxMainRows = 3; // 縦3列固定

  for (const stack of cardStacks) {
    const x = mainX;
    const y = mainY;
    imageLoadPromises.push(
      loadImage(`${basePath}/assets/cards_img/${stack.card.image}`).then(img => ({
        img, x, y, isStack: true, count: stack.count
      })).catch(error => {
        console.error('Failed to load main deck card image:', error);
        return null;
      })
    );

    mainRow++;
    if (mainRow >= maxMainRows) {
      mainRow = 0;
      mainX += cardWidth + margin;
      mainY = startY;
    } else {
      mainY += cardHeight + margin;
    }
  }

  // 全ての画像をロード
  console.log('[generateStackDeckImage] Waiting for images...', imageLoadPromises.length);
  const loadedImages = await Promise.all(imageLoadPromises);
  console.log('[generateStackDeckImage] Images loaded', loadedImages.length);

  // 全ての画像を描画
  let drawnCount = 0;
  for (const item of loadedImages) {
    if (!item) {
      console.log('[generateStackDeckImage] Skipping null item');
      continue;
    }

    ctx.drawImage(item.img, item.x, item.y, cardWidth, cardHeight);
    drawnCount++;

    // スタック表示の枚数を描画
    if (item.isStack && item.count) {
      const countText = `×${item.count}`;
      const countBgHeight = 28;
      const countBgY = item.y + cardHeight - countBgHeight;

      // 背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(item.x, countBgY, cardWidth, countBgHeight);

      // テキスト
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(countText, item.x + cardWidth / 2, countBgY + countBgHeight / 2);
    }
  }

  console.log('[generateStackDeckImage] Complete', { drawnCount, totalImages: loadedImages.length });
  return canvas;
}

// Canvasを画像としてダウンロード
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpg' = 'png') {
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

// Canvasをクリップボードにコピー
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob'));
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        resolve();
      } catch (error) {
        reject(error);
      }
    }, 'image/png');
  });
}
