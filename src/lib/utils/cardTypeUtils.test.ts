import { describe, it, expect } from 'vitest';
import {
  isLrigCard,
  isMainDeckCard,
  isCenterLrig,
  isAssist,
  isPiece,
  isArts,
} from './cardTypeUtils';
import { makeCard } from '$lib/test/factories';

describe('cardTypeUtils', () => {
  it('isLrigCard はルリグ系の先頭タイプを判定する', () => {
    expect(isLrigCard(makeCard({ cardType: ['ルリグ'] }))).toBe(true);
    expect(isLrigCard(makeCard({ cardType: ['アシスト'] }))).toBe(true);
    expect(isLrigCard(makeCard({ cardType: ['ピース'] }))).toBe(true);
    expect(isLrigCard(makeCard({ cardType: ['アーツ'] }))).toBe(true);
    expect(isLrigCard(makeCard({ cardType: ['シグニ'] }))).toBe(false);
  });

  it('isMainDeckCard はメイン系の先頭タイプを判定する', () => {
    expect(isMainDeckCard(makeCard({ cardType: ['シグニ'] }))).toBe(true);
    expect(isMainDeckCard(makeCard({ cardType: ['スペル'] }))).toBe(true);
    expect(isMainDeckCard(makeCard({ cardType: ['サーバント'] }))).toBe(true);
    expect(isMainDeckCard(makeCard({ cardType: ['ルリグ'] }))).toBe(false);
  });

  it('細分類はタイプ配列の包含で判定する（先頭でなくてもよい）', () => {
    expect(isCenterLrig(makeCard({ cardType: ['ルリグ'] }))).toBe(true);
    expect(isAssist(makeCard({ cardType: ['アシスト'] }))).toBe(true);
    expect(isPiece(makeCard({ cardType: ['ピース', 'リレー'] }))).toBe(true);
    expect(isArts(makeCard({ cardType: ['アーツ'] }))).toBe(true);
    expect(isAssist(makeCard({ cardType: ['ルリグ'] }))).toBe(false);
  });

  it('cardType が空でも例外を投げない', () => {
    expect(isLrigCard(makeCard({ cardType: [] }))).toBe(false);
    expect(isMainDeckCard(makeCard({ cardType: [] }))).toBe(false);
  });
});
