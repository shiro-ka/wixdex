import { isLrigCard, isMainDeckCard, DECK_LIMITS } from './cardTypeUtils';

// カードをデッキに追加
export function addCardToDeck(card, mainDeck, lrigDeck) {
  // ルリグデッキの処理
  if (isLrigCard(card)) {
    if (lrigDeck.length >= DECK_LIMITS.LRIG) {
      return { mainDeck, lrigDeck }; // 上限に達している
    }
    return {
      mainDeck,
      lrigDeck: [...lrigDeck, card],
    };
  }

  // メインデッキの処理
  if (isMainDeckCard(card)) {
    if (mainDeck.length >= DECK_LIMITS.MAIN) {
      return { mainDeck, lrigDeck }; // 上限に達している
    }
    const sameNameCount = mainDeck.filter(c => c.name === card.name).length;
    if (sameNameCount >= DECK_LIMITS.SAME_NAME) {
      return { mainDeck, lrigDeck }; // 同名カード上限に達している
    }
    return {
      mainDeck: [...mainDeck, card],
      lrigDeck,
    };
  }

  // どちらでもない場合は変更なし
  return { mainDeck, lrigDeck };
}

// カードをデッキから削除
export function removeCardFromDeck(card, mainDeck, lrigDeck, specificIndex = null, deckType = null) {
  // 特定のインデックスが指定されている場合はそれを使用
  if (specificIndex !== null && deckType !== null) {
    if (deckType === 'lrig') {
      if (specificIndex >= 0 && specificIndex < lrigDeck.length) {
        const newLrigDeck = [...lrigDeck];
        newLrigDeck.splice(specificIndex, 1);
        return {
          mainDeck,
          lrigDeck: newLrigDeck,
        };
      }
      return { mainDeck, lrigDeck };
    } else if (deckType === 'main') {
      if (specificIndex >= 0 && specificIndex < mainDeck.length) {
        const newMainDeck = [...mainDeck];
        newMainDeck.splice(specificIndex, 1);
        return {
          mainDeck: newMainDeck,
          lrigDeck,
        };
      }
      return { mainDeck, lrigDeck };
    }
  }

  // 従来の動作（IDで最初のマッチを削除）
  // ルリグデッキの処理
  if (isLrigCard(card)) {
    const index = lrigDeck.findIndex(c => c.id === card.id);
    if (index !== -1) {
      const newLrigDeck = [...lrigDeck];
      newLrigDeck.splice(index, 1);
      return {
        mainDeck,
        lrigDeck: newLrigDeck,
      };
    }
    return { mainDeck, lrigDeck };
  }

  // メインデッキの処理
  if (isMainDeckCard(card)) {
    const index = mainDeck.findIndex(c => c.id === card.id);
    if (index !== -1) {
      const newMainDeck = [...mainDeck];
      newMainDeck.splice(index, 1);
      return {
        mainDeck: newMainDeck,
        lrigDeck,
      };
    }
    return { mainDeck, lrigDeck };
  }

  // どちらでもない場合は変更なし
  return { mainDeck, lrigDeck };
}
