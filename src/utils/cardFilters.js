/**
 * カードをフィルタリングする
 */
export function filterCards(cards, filters) {
  const {
    selectedColors,
    selectedLevels,
    selectedCardTypes,
    selectedLrigClasses,
    lifeBurstFilter,
    searchText,
  } = filters;

  return cards.filter(card => {
    // 色によるフィルタリング
    const colorMatch = selectedColors.size === 0 ||
      card.color.some(color => selectedColors.has(color));

    // レベルによるフィルタリング
    const levelMatch = selectedLevels.size === 0 ||
      selectedLevels.has(card.level);

    // カード種類によるフィルタリング
    const cardTypeMatch = selectedCardTypes.size === 0 ||
      card.cardType.some(type => selectedCardTypes.has(type));

    // ルリグクラスによるフィルタリング
    const lrigClassMatch = selectedLrigClasses.size === 0 ||
      (card.lrigType && card.lrigType.some(lrigClass => selectedLrigClasses.has(lrigClass))) ||
      (card.class && card.class.some(className => selectedLrigClasses.has(className)));

    // ライフバーストによるフィルタリング
    const lifeBurstMatch = lifeBurstFilter === null ||
      card.lifeBurst === lifeBurstFilter.toString();

    // テキストによるフィルタリング
    const textMatch = searchText === '' ||
      card.name.toLowerCase().includes(searchText.toLowerCase()) ||
      card.subName.some(name => name.toLowerCase().includes(searchText.toLowerCase()));

    // 全ての条件を満たすカードのみを表示
    return colorMatch && levelMatch && cardTypeMatch && lrigClassMatch && lifeBurstMatch && textMatch;
  });
}
