import { describe, it, expect } from 'vitest';
import { filterCards } from './cardFilters';
import type { FilterState } from '$lib/types';
import { makeCard } from '$lib/test/factories';

const base: FilterState = {
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
  candidateCards: [],
  favoriteFilter: false,
  favoriteIds: new Set(),
};

const red = makeCard({
  cardID: 'R1',
  name: 'アルファ',
  subName: ['あるふぁ'],
  color: ['赤'],
  level: 2,
  cardType: ['シグニ'],
  lrigTypeClass: ['精元'],
  tags: ['チームX'],
  lifeBurst: true,
  text: [{ label: '', body: 'パワーが上がる' }],
});
const blue = makeCard({
  cardID: 'B1',
  name: 'ベータ',
  subName: ['べーた'],
  color: ['青'],
  level: 1,
  cardType: ['シグニ'],
  lifeBurst: false,
});

const cards = [red, blue];
const ids = (cs: typeof cards) => cs.map((c) => c.cardID);

describe('filterCards', () => {
  it('フィルタ未指定なら全件返す', () => {
    expect(filterCards(cards, base)).toHaveLength(2);
  });

  it('色で絞り込む', () => {
    expect(ids(filterCards(cards, { ...base, selectedColors: new Set(['赤']) }))).toEqual(['R1']);
  });

  it('レベルで絞り込む', () => {
    expect(ids(filterCards(cards, { ...base, selectedLevels: new Set([2]) }))).toEqual(['R1']);
  });

  it('ルリグタイプ/クラスで絞り込む', () => {
    expect(ids(filterCards(cards, { ...base, selectedLrigClasses: new Set(['精元']) }))).toEqual([
      'R1',
    ]);
  });

  it('タグで絞り込む', () => {
    expect(ids(filterCards(cards, { ...base, selectedTags: new Set(['チームX']) }))).toEqual(['R1']);
  });

  it('ライフバーストの有無で絞り込む', () => {
    expect(ids(filterCards(cards, { ...base, lifeBurstFilter: true }))).toEqual(['R1']);
    expect(ids(filterCards(cards, { ...base, lifeBurstFilter: false }))).toEqual(['B1']);
  });

  it('カード名・読みで検索する', () => {
    expect(ids(filterCards(cards, { ...base, searchText: 'アルファ' }))).toEqual(['R1']);
    expect(ids(filterCards(cards, { ...base, searchText: 'べーた' }))).toEqual(['B1']);
  });

  it('テキスト本文検索は searchInText のときだけ効く', () => {
    expect(
      ids(filterCards(cards, { ...base, searchName: false, searchInText: true, searchText: 'パワー' })),
    ).toEqual(['R1']);
    // searchInText が無効なら本文にヒットしない
    expect(filterCards(cards, { ...base, searchName: false, searchText: 'パワー' })).toHaveLength(0);
  });

  it('候補カードフィルタ', () => {
    expect(
      ids(filterCards(cards, { ...base, candidateFilter: true, candidateCards: [red] })),
    ).toEqual(['R1']);
  });

  it('お気に入りフィルタ', () => {
    expect(
      ids(filterCards(cards, { ...base, favoriteFilter: true, favoriteIds: new Set(['R1']) })),
    ).toEqual(['R1']);
  });
});
