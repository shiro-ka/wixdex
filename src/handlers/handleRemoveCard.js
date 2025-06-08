export function handleRemoveCard(card, mainDeck, lrigDeck, setMainDeck, setLrigDeck) {
  const cardType = card.cardType?.[0] ?? '';
  
  // ルリグ系の処理
  if (['ルリグ', 'アシストルリグ', 'ピース', 'アーツ'].includes(cardType)) {
    const index = lrigDeck.findIndex(c => c.id === card.id);
    if (index !== -1) {
      const newLrigDeck = [...lrigDeck];
      newLrigDeck.splice(index, 1);
      setLrigDeck(newLrigDeck);
      return { newMainDeck: mainDeck, newLrigDeck: newLrigDeck };
    }
    return { newMainDeck: mainDeck, newLrigDeck };
  }
  
  // メインデッキ系
  if (['シグニ', 'スペル', 'サーバント'].includes(cardType)) {
    const index = mainDeck.findIndex(c => c.id === card.id);
    if (index !== -1) {
      const newMainDeck = [...mainDeck];
      newMainDeck.splice(index, 1);
      setMainDeck(newMainDeck);
      return { newMainDeck: newMainDeck, newLrigDeck };
    }
    return { newMainDeck, newLrigDeck };
  }
  
  return { newMainDeck: mainDeck, newLrigDeck };
} 