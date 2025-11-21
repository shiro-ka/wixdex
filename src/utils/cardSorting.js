// カードのソート機能

// カードタイプの優先順位（ルリグデッキ）
const LRIG_CARD_TYPE_ORDER = {
  'ルリグ': 1,
  'アシスト': 2,
  'ピース': 3,
  'アーツ': 4,
};

// カードタイプの優先順位（メインデッキ）
const MAIN_CARD_TYPE_ORDER = {
  'シグニ': 1,
  'スペル': 2,
  'サーバント': 3,
};

// 色の優先順位
const COLOR_ORDER = {
  '白': 1,
  '赤': 2,
  '青': 3,
  '緑': 4,
  '黒': 5,
  '多色': 6,
  '無色': 7,
};

// カードタイプの優先順位を取得（ルリグデッキ用）
function getLrigCardTypePriority(card) {
  const cardType = card.cardType?.[0] ?? '';
  return LRIG_CARD_TYPE_ORDER[cardType] ?? 999;
}

// カードタイプの優先順位を取得（メインデッキ用）
function getMainCardTypePriority(card) {
  const cardType = card.cardType?.[0] ?? '';
  return MAIN_CARD_TYPE_ORDER[cardType] ?? 999;
}

// 色の優先順位を取得
function getColorPriority(card) {
  const color = card.color?.[0] ?? '無色';
  // 複数色の場合は多色扱い
  if (card.color && card.color.length > 1) {
    return COLOR_ORDER['多色'] ?? 6;
  }
  return COLOR_ORDER[color] ?? 7;
}

// レベルを取得（数値に変換）
function getLevel(card) {
  const level = card.level?.[0];
  if (typeof level === 'number') return level;
  if (typeof level === 'string') {
    const parsed = parseInt(level, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// ルリグタイプ（アシスト用）を取得して50音順でソート
function getLrigTypeSortKey(card) {
  const lrigType = card.lrigType?.[0] ?? '';
  return lrigType; // 文字列比較で自動的に50音順になる
}

// ルリグデッキをソート
export function sortLrigDeck(lrigDeck) {
  return [...lrigDeck].sort((a, b) => {
    // 1. カードタイプでソート（ルリグ→アシスト→ピース→アーツ）
    const typeDiff = getLrigCardTypePriority(a) - getLrigCardTypePriority(b);
    if (typeDiff !== 0) return typeDiff;

    // 2. ルリグタイプでソート（アシストの場合のみ、50音順）
    const isAssistA = a.cardType?.[0] === 'アシスト';
    const isAssistB = b.cardType?.[0] === 'アシスト';
    if (isAssistA && isAssistB) {
      const lrigTypeDiff = getLrigTypeSortKey(a).localeCompare(getLrigTypeSortKey(b), 'ja');
      if (lrigTypeDiff !== 0) return lrigTypeDiff;

      // 3. レベルでソート（アシストの場合、1→2）
      const levelDiff = getLevel(a) - getLevel(b);
      if (levelDiff !== 0) return levelDiff;
    }

    // 4. IDでソート
    const idA = a.id ?? '';
    const idB = b.id ?? '';
    return idA.localeCompare(idB);
  });
}

// メインデッキをソート
export function sortMainDeck(mainDeck) {
  return [...mainDeck].sort((a, b) => {
    // 1. カードタイプでソート（シグニ→スペル→サーバント）
    const typeDiff = getMainCardTypePriority(a) - getMainCardTypePriority(b);
    if (typeDiff !== 0) return typeDiff;

    // 2. レベルでソート（シグニの場合のみ、1→2→3）
    const isSigniA = a.cardType?.[0] === 'シグニ';
    const isSigniB = b.cardType?.[0] === 'シグニ';
    if (isSigniA && isSigniB) {
      const levelDiff = getLevel(a) - getLevel(b);
      if (levelDiff !== 0) return levelDiff;
    }

    // 3. 色でソート（白→赤→青→緑→黒→多色→無色）
    const colorDiff = getColorPriority(a) - getColorPriority(b);
    if (colorDiff !== 0) return colorDiff;

    // 4. IDでソート
    const idA = a.id ?? '';
    const idB = b.id ?? '';
    return idA.localeCompare(idB);
  });
}
