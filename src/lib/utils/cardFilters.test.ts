import { describe, it, expect } from 'vitest';
import type { Card, FilterState } from '$lib/types';
import { filterCards } from './cardFilters';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    cardID: `id-${Math.random()}`,
    productID: null,
    image: `img-${Math.random()}`,
    name: '',
    subName: [],
    rarity: '',
    illust: '',
    cardType: ['シグニ'],
    lrigTypeClass: null,
    color: ['白'],
    level: null,
    cost: null,
    power: null,
    timing: null,
    lifeBurst: null,
    text: [],
    flavorText: '',
    faq: [],
    tags: [],
    ...overrides,
  };
}

function makeFilters(overrides: Partial<FilterState> = {}): FilterState {
  return {
    selectedColors: new Set(),
    selectedLevels: new Set(),
    selectedCardTypes: new Set(),
    selectedLrigClasses: new Set(),
    selectedTags: new Set(),
    lifeBurstFilter: null,
    searchText: '',
    searchName: true,
    searchInText: false,
    candidateFilter: false,
    favoriteFilter: false,
    ...overrides,
  };
}

describe('filterCards: フィルタなし', () => {
  it('全フィルタ空なら全件返す', () => {
    const cards = [makeCard(), makeCard()];
    expect(filterCards(cards, makeFilters())).toHaveLength(2);
  });
});

describe('filterCards: 色/レベル/種別/LB', () => {
  it('色は OR (いずれかの色を含めばヒット)', () => {
    const white = makeCard({ color: ['白'] });
    const red = makeCard({ color: ['赤'] });
    const multi = makeCard({ color: ['白', '赤'] });
    const res = filterCards([white, red, multi], makeFilters({ selectedColors: new Set(['赤']) }));
    expect(res).toEqual([red, multi]);
  });

  it('レベルは完全一致、level=null は除外', () => {
    const lv1 = makeCard({ level: 1 });
    const lv2 = makeCard({ level: 2 });
    const noLv = makeCard({ level: null });
    const res = filterCards([lv1, lv2, noLv], makeFilters({ selectedLevels: new Set([1]) }));
    expect(res).toEqual([lv1]);
  });

  it('ライフバーストは true/false を区別', () => {
    const lb = makeCard({ lifeBurst: true });
    const noLb = makeCard({ lifeBurst: false });
    expect(filterCards([lb, noLb], makeFilters({ lifeBurstFilter: true }))).toEqual([lb]);
    expect(filterCards([lb, noLb], makeFilters({ lifeBurstFilter: false }))).toEqual([noLb]);
  });

  it('複数フィルタは AND', () => {
    const hit = makeCard({ color: ['青'], level: 3 });
    const miss = makeCard({ color: ['青'], level: 1 });
    const res = filterCards([hit, miss], makeFilters({
      selectedColors: new Set(['青']), selectedLevels: new Set([3]),
    }));
    expect(res).toEqual([hit]);
  });
});

describe('filterCards: テキスト検索', () => {
  const tama = makeCard({ name: 'タマ', subName: ['たま'], text: [{ label: '', body: 'アタックする' }] });
  const yuki = makeCard({ name: 'ユキ', subName: ['ゆき'], text: [{ label: '', body: 'タマを参照' }] });

  it('カード名検索 (searchName)', () => {
    const res = filterCards([tama, yuki], makeFilters({ searchText: 'タマ', searchName: true, searchInText: false }));
    expect(res).toEqual([tama]);
  });

  it('読み(subName)もカード名検索の対象', () => {
    const res = filterCards([tama, yuki], makeFilters({ searchText: 'ゆき', searchName: true }));
    expect(res).toEqual([yuki]);
  });

  it('手動で足した検索語(alias)もカード名検索の対象', () => {
    const zen = makeCard({ name: '全力疾走', subName: ['じゃいあんとなっくる'], alias: ['ぜんりょくしっそう', 'じゃいな'] });
    const res = filterCards([zen, tama], makeFilters({ searchText: 'じゃいな', searchName: true }));
    expect(res).toEqual([zen]);
  });

  it('alias が無いカードでも落ちない', () => {
    const res = filterCards([tama, yuki], makeFilters({ searchText: 'じゃいな', searchName: true }));
    expect(res).toEqual([]);
  });

  it('テキスト本文検索 (searchInText)', () => {
    const res = filterCards([tama, yuki], makeFilters({ searchText: 'タマを参照', searchName: false, searchInText: true }));
    expect(res).toEqual([yuki]);
  });

  it('名前OR本文 (両方ONならどちらでヒットしてもOK)', () => {
    const res = filterCards([tama, yuki], makeFilters({ searchText: 'タマ', searchName: true, searchInText: true }));
    expect(res).toEqual([tama, yuki]);
  });

  it('両方OFFなら入力を無視して全件返す(0件トラップを防ぐ)', () => {
    const res = filterCards([tama, yuki], makeFilters({ searchText: 'タマ', searchName: false, searchInText: false }));
    expect(res).toEqual([tama, yuki]);
  });
});

describe('filterCards: お気に入り/候補', () => {
  it('お気に入りは favoriteIds に含まれる cardID のみ', () => {
    const a = makeCard({ cardID: 'A' });
    const b = makeCard({ cardID: 'B' });
    const res = filterCards([a, b], makeFilters({ favoriteFilter: true, favoriteIds: new Set(['A']) }));
    expect(res).toEqual([a]);
  });

  it('候補は同一カード(cardID か image 一致)のみ', () => {
    const a = makeCard({ cardID: 'A', image: 'imgA' });
    const b = makeCard({ cardID: 'B', image: 'imgB' });
    const res = filterCards([a, b], makeFilters({
      candidateFilter: true, candidateCards: [makeCard({ cardID: 'A', image: 'imgA' })],
    }));
    expect(res).toEqual([a]);
  });
});
