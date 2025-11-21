import { isLrigCard, isMainDeckCard, DECK_LIMITS } from './cardTypeUtils';

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

// ルリグデッキに追加可能かチェック
export function canAddToLrigDeck(card, lrigDeck) {
  if (!isLrigCard(card)) {
    return { valid: false, error: 'このカードはルリグデッキに入りません' };
  }

  const sizeCheck = validateLrigDeckSize(lrigDeck, card);
  if (!sizeCheck.valid) return sizeCheck;

  // TODO: ここに追加の制限を実装
  // - ルリグの同名制限
  // - アシストの制限
  // - ピースの制限
  // - アーツの制限

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