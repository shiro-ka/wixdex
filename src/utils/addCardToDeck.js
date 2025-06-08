export function addCardToDeck(card, mainDeck, lrigDeck) {
  const cardType = card.cardType?.[0] ?? '';
  // ルリグ系の処理
  if (['ルリグ', 'アシストルリグ', 'ピース', 'アーツ'].includes(cardType)) {
    if (lrigDeck.length >= 8) return lrigDeck;
    return [...lrigDeck, card];
  }
  // メインデッキ系
  if (['シグニ', 'スペル', 'サーバント'].includes(cardType)) {
    if (mainDeck.length >= 40) return mainDeck;
    const sameNameCount = mainDeck.filter(c => c.name === card.name).length;
    if (sameNameCount >= 4) return mainDeck;
    return [...mainDeck, card];
  }
  return { mainDeck, lrigDeck };
}
