import {
  isLrigCard,
  isMainDeckCard,
  isCenterLrig,
  isAssist,
  isPiece,
  isArts,
  DECK_LIMITS
} from './cardTypeUtils';

// バリデーション結果の型
// { valid: boolean, error?: string }

// ルリグデッキの枚数制限チェック
export function validateLrigDeckSize(lrigDeck, cardToAdd) {
  if (lrigDeck.length >= DECK_LIMITS.LRIG) {
    return {
      valid: false,
      error: 'ルリグデッキは8枚までです',
    };
  }
  return { valid: true };
}

// メインデッキの枚数制限チェック
export function validateMainDeckSize(mainDeck, cardToAdd) {
  if (mainDeck.length >= DECK_LIMITS.MAIN) {
    return {
      valid: false,
      error: 'メインデッキは40枚までです',
    };
  }
  return { valid: true };
}

// 同名カード制限チェック（メインデッキ用）
export function validateSameNameLimit(mainDeck, cardToAdd) {
  const sameNameCount = mainDeck.filter(c => c.name === cardToAdd.name).length;
  if (sameNameCount >= DECK_LIMITS.SAME_NAME) {
    return {
      valid: false,
      error: `同名カードは${DECK_LIMITS.SAME_NAME}枚までです`,
    };
  }
  return { valid: true };
}

// ルリグデッキの同名カード制限チェック
export function validateLrigSameNameLimit(lrigDeck, cardToAdd) {
  const sameNameCount = lrigDeck.filter(c => c.name === cardToAdd.name).length;
  if (sameNameCount >= DECK_LIMITS.LRIG_SAME_NAME) {
    return {
      valid: false,
      error: 'ルリグデッキの同名カードは1枚までです',
    };
  }
  return { valid: true };
}

// センタールリグの枚数制限チェック
export function validateCenterLimit(lrigDeck, cardToAdd) {
  if (!isCenterLrig(cardToAdd)) return { valid: true };

  const centerCount = lrigDeck.filter(c => isCenterLrig(c)).length;
  if (centerCount >= DECK_LIMITS.CENTER) {
    return {
      valid: false,
      error: 'センタールリグは1枚までです',
    };
  }
  return { valid: true };
}

// アシストの枚数制限チェック
export function validateAssistLimit(lrigDeck, cardToAdd) {
  if (!isAssist(cardToAdd)) return { valid: true };

  const assistCount = lrigDeck.filter(c => isAssist(c)).length;
  if (assistCount >= DECK_LIMITS.ASSIST) {
    return {
      valid: false,
      error: 'アシストは4枚までです',
    };
  }
  return { valid: true };
}

// ピースの枚数制限チェック
export function validatePieceLimit(lrigDeck, cardToAdd) {
  if (!isPiece(cardToAdd)) return { valid: true };

  const pieceCount = lrigDeck.filter(c => isPiece(c)).length;
  if (pieceCount >= DECK_LIMITS.PIECE) {
    return {
      valid: false,
      error: 'ピースは2枚までです',
    };
  }
  return { valid: true };
}

// アーツの枚数制限チェック
export function validateArtsLimit(lrigDeck, cardToAdd) {
  if (!isArts(cardToAdd)) return { valid: true };

  const artsCount = lrigDeck.filter(c => isArts(c)).length;
  if (artsCount >= DECK_LIMITS.ARTS) {
    return {
      valid: false,
      error: 'アーツは6枚までです',
    };
  }
  return { valid: true };
}

// ルリグデッキに追加可能かチェック
export function canAddToLrigDeck(card, lrigDeck) {
  if (!isLrigCard(card)) {
    return { valid: false, error: 'このカードはルリグデッキに入りません' };
  }

  // 全体の枚数制限
  const sizeCheck = validateLrigDeckSize(lrigDeck, card);
  if (!sizeCheck.valid) return sizeCheck;

  // 同名カード制限
  const sameNameCheck = validateLrigSameNameLimit(lrigDeck, card);
  if (!sameNameCheck.valid) return sameNameCheck;

  // センター制限
  const centerCheck = validateCenterLimit(lrigDeck, card);
  if (!centerCheck.valid) return centerCheck;

  // アシスト制限
  const assistCheck = validateAssistLimit(lrigDeck, card);
  if (!assistCheck.valid) return assistCheck;

  // ピース制限
  const pieceCheck = validatePieceLimit(lrigDeck, card);
  if (!pieceCheck.valid) return pieceCheck;

  // アーツ制限
  const artsCheck = validateArtsLimit(lrigDeck, card);
  if (!artsCheck.valid) return artsCheck;

  return { valid: true };
}

// メインデッキに追加可能かチェック
export function canAddToMainDeck(card, mainDeck) {
  if (!isMainDeckCard(card)) {
    return { valid: false, error: 'このカードはメインデッキに入りません' };
  }

  const sizeCheck = validateMainDeckSize(mainDeck, card);
  if (!sizeCheck.valid) return sizeCheck;

  const nameCheck = validateSameNameLimit(mainDeck, card);
  if (!nameCheck.valid) return nameCheck;

  return { valid: true };
}

// カードを追加可能かチェック（メイン関数）
export function canAddCard(card, mainDeck, lrigDeck) {
  if (isLrigCard(card)) {
    return canAddToLrigDeck(card, lrigDeck);
  }

  if (isMainDeckCard(card)) {
    return canAddToMainDeck(card, mainDeck);
  }

  return { valid: false, error: '不明なカードタイプです' };
}