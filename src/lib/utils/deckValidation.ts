import type { Card, ValidationResult } from '$lib/types';
import {
  isLrigCard, isMainDeckCard,
  isCenterLrig, isAssist, isPiece, isArts, DECK_LIMITS,
} from './cardTypeUtils';

function validateLrigDeckSize(lrigDeck: Card[]): ValidationResult {
  return lrigDeck.length >= DECK_LIMITS.LRIG
    ? { valid: false, error: 'ルリグデッキは8枚までです' }
    : { valid: true };
}
function validateMainDeckSize(mainDeck: Card[]): ValidationResult {
  return mainDeck.length >= DECK_LIMITS.MAIN
    ? { valid: false, error: 'メインデッキは40枚までです' }
    : { valid: true };
}
function validateSameNameLimit(mainDeck: Card[], card: Card): ValidationResult {
  return mainDeck.filter(c => c.name === card.name).length >= DECK_LIMITS.SAME_NAME
    ? { valid: false, error: `同名カードは${DECK_LIMITS.SAME_NAME}枚までです` }
    : { valid: true };
}
function validateLrigSameNameLimit(lrigDeck: Card[], card: Card): ValidationResult {
  return lrigDeck.filter(c => c.name === card.name).length >= DECK_LIMITS.LRIG_SAME_NAME
    ? { valid: false, error: 'ルリグデッキの同名カードは1枚までです' }
    : { valid: true };
}
function validateCenterLimit(lrigDeck: Card[], card: Card): ValidationResult {
  if (!isCenterLrig(card)) return { valid: true };
  return lrigDeck.filter(c => isCenterLrig(c)).length >= DECK_LIMITS.CENTER
    ? { valid: false, error: 'センタールリグは1枚までです' }
    : { valid: true };
}
function validateAssistLimit(lrigDeck: Card[], card: Card): ValidationResult {
  if (!isAssist(card)) return { valid: true };
  return lrigDeck.filter(c => isAssist(c)).length >= DECK_LIMITS.ASSIST
    ? { valid: false, error: 'アシストは4枚までです' }
    : { valid: true };
}
function validatePieceLimit(lrigDeck: Card[], card: Card): ValidationResult {
  if (!isPiece(card)) return { valid: true };
  return lrigDeck.filter(c => isPiece(c)).length >= DECK_LIMITS.PIECE
    ? { valid: false, error: 'ピースは2枚までです' }
    : { valid: true };
}
function validateArtsLimit(lrigDeck: Card[], card: Card): ValidationResult {
  if (!isArts(card)) return { valid: true };
  return lrigDeck.filter(c => isArts(c)).length >= DECK_LIMITS.ARTS
    ? { valid: false, error: 'アーツは6枚までです' }
    : { valid: true };
}

export function canAddToLrigDeck(card: Card, lrigDeck: Card[]): ValidationResult {
  if (!isLrigCard(card)) return { valid: false, error: 'このカードはルリグデッキに入りません' };
  for (const check of [
    validateLrigDeckSize(lrigDeck),
    validateLrigSameNameLimit(lrigDeck, card),
    validateCenterLimit(lrigDeck, card),
    validateAssistLimit(lrigDeck, card),
    validatePieceLimit(lrigDeck, card),
    validateArtsLimit(lrigDeck, card),
  ]) {
    if (!check.valid) return check;
  }
  return { valid: true };
}

export function canAddToMainDeck(card: Card, mainDeck: Card[]): ValidationResult {
  if (!isMainDeckCard(card)) return { valid: false, error: 'このカードはメインデッキに入りません' };
  for (const check of [
    validateMainDeckSize(mainDeck),
    validateSameNameLimit(mainDeck, card),
  ]) {
    if (!check.valid) return check;
  }
  return { valid: true };
}

export function canAddCard(card: Card, mainDeck: Card[], lrigDeck: Card[]): ValidationResult {
  if (isLrigCard(card)) return canAddToLrigDeck(card, lrigDeck);
  if (isMainDeckCard(card)) return canAddToMainDeck(card, mainDeck);
  return { valid: false, error: '不明なカードタイプです' };
}
