import { describe, it, expect } from 'vitest';
import type { Card } from '$lib/types';
import { canAddCard, canAddToMainDeck, canAddToLrigDeck } from './deckValidation';

/** テスト用の最小カード生成。cardType と name 以外は構築ルールに無関係なのでダミー。 */
function makeCard(cardType: string[], name = cardType[0]): Card {
  return {
    cardID: `${name}-${Math.random()}`,
    productID: null,
    image: '',
    name,
    subName: [],
    rarity: '',
    illust: '',
    cardType,
    lrigTypeClass: null,
    color: ['無'],
    level: null,
    cost: null,
    power: null,
    timing: null,
    lifeBurst: null,
    text: [],
    flavorText: '',
    faq: [],
    tags: [],
  };
}

/** 同名カードを n 枚並べる */
const repeat = (card: Card, n: number): Card[] => Array.from({ length: n }, () => card);
/** 種別ごとに異なる名前のカードを n 枚並べる(同名制限を避けたいとき用) */
const distinct = (cardType: string[], n: number): Card[] =>
  Array.from({ length: n }, (_, i) => makeCard(cardType, `${cardType[0]}-${i}`));

const signi = makeCard(['シグニ']);
const lrig = makeCard(['ルリグ']);
const assist = makeCard(['アシスト']);

describe('canAddCard ルーティング', () => {
  it('ルリグ系はルリグデッキ判定へ', () => {
    expect(canAddCard(lrig, [], []).valid).toBe(true);
  });
  it('メイン系はメインデッキ判定へ', () => {
    expect(canAddCard(signi, [], []).valid).toBe(true);
  });
  it('未知の種別はエラー', () => {
    const unknown = makeCard(['コイン']);
    expect(canAddCard(unknown, [], [])).toEqual({ valid: false, error: '不明なカードタイプです' });
  });
});

describe('メインデッキ', () => {
  it('40枚未満なら追加できる', () => {
    expect(canAddToMainDeck(signi, distinct(['シグニ'], 39)).valid).toBe(true);
  });
  it('40枚に達したら追加できない', () => {
    const res = canAddToMainDeck(signi, distinct(['シグニ'], 40));
    expect(res).toEqual({ valid: false, error: 'メインデッキは40枚までです' });
  });
  it('同名は4枚まで', () => {
    expect(canAddToMainDeck(signi, repeat(signi, 3)).valid).toBe(true);
    const res = canAddToMainDeck(signi, repeat(signi, 4));
    expect(res).toEqual({ valid: false, error: '同名カードは4枚までです' });
  });
  it('ルリグ系はメインデッキに入らない', () => {
    expect(canAddToMainDeck(lrig, [])).toEqual({
      valid: false,
      error: 'このカードはメインデッキに入りません',
    });
  });
});

describe('ルリグデッキ', () => {
  it('メイン系はルリグデッキに入らない', () => {
    expect(canAddToLrigDeck(signi, [])).toEqual({
      valid: false,
      error: 'このカードはルリグデッキに入りません',
    });
  });
  it('合計8枚まで', () => {
    const full = [...distinct(['アーツ'], 6), ...distinct(['ピース'], 2)]; // 8枚
    expect(full).toHaveLength(8);
    const res = canAddToLrigDeck(makeCard(['アシスト'], '新規'), full);
    expect(res).toEqual({ valid: false, error: 'ルリグデッキは8枚までです' });
  });
  it('同名は1枚まで', () => {
    const res = canAddToLrigDeck(assist, [assist]);
    expect(res).toEqual({ valid: false, error: 'ルリグデッキの同名カードは1枚までです' });
  });
  it('センタールリグは1枚まで', () => {
    const res = canAddToLrigDeck(makeCard(['ルリグ'], '別ルリグ'), [lrig]);
    expect(res).toEqual({ valid: false, error: 'センタールリグは1枚までです' });
  });
  it('アシストは4枚まで', () => {
    expect(canAddToLrigDeck(makeCard(['アシスト'], '新規'), distinct(['アシスト'], 3)).valid).toBe(true);
    const res = canAddToLrigDeck(makeCard(['アシスト'], '新規'), distinct(['アシスト'], 4));
    expect(res).toEqual({ valid: false, error: 'アシストは4枚までです' });
  });
  it('ピースは2枚まで', () => {
    const res = canAddToLrigDeck(makeCard(['ピース'], '新規'), distinct(['ピース'], 2));
    expect(res).toEqual({ valid: false, error: 'ピースは2枚までです' });
  });
  it('アーツは6枚まで', () => {
    const res = canAddToLrigDeck(makeCard(['アーツ'], '新規'), distinct(['アーツ'], 6));
    expect(res).toEqual({ valid: false, error: 'アーツは6枚までです' });
  });
});

describe('主種別は先頭(cardType[0])のみで判定する', () => {
  // ピースだが裏面ルリグ等の複合種別。ルール上「ピース」としてのみ扱う。
  const pieceBackLrig = makeCard(['ピース', 'ルリグ'], '裏面ルリグのピース');

  it('複合種別カードは先頭のピースとして扱われる(ルリグ枠に二重カウントしない)', () => {
    // センターが既に1枚あっても、ピース(裏面ルリグ)はセンター制限に引っかからない
    const res = canAddToLrigDeck(pieceBackLrig, [lrig]);
    expect(res.valid).toBe(true);
  });

  it('複合種別カードはピース枠を消費する', () => {
    const res = canAddToLrigDeck(makeCard(['ピース', 'ルリグ'], '新規'), distinct(['ピース'], 2));
    expect(res).toEqual({ valid: false, error: 'ピースは2枚までです' });
  });

  it('先頭がメイン種別なら裏面種別に関係なくメインデッキ扱い', () => {
    const signiBackLrig = makeCard(['シグニ', 'ルリグ'], '裏面ルリグのシグニ');
    expect(canAddCard(signiBackLrig, [], []).valid).toBe(true); // メイン側で受理
    expect(canAddToLrigDeck(signiBackLrig, [])).toEqual({
      valid: false,
      error: 'このカードはルリグデッキに入りません',
    });
  });
});
