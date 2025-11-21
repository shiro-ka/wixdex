export type CardColor = '白' | '赤' | '青' | '緑' | '黒' | '';
export type CardLevel = 0 | 1 | 2 | 3;
export type LifeBurstValue = 'true' | 'false' | 'null';

export interface Card {
  id?: string;
  name: string;
  subName: string[];
  image: string;
  cardType: string[];
  lrigTypeClass: string[];
  level: CardLevel;
  color: CardColor[];
  lifeBurst: LifeBurstValue;
  tags: string[];
}
