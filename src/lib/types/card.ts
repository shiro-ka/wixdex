export type CardColor = '白' | '赤' | '青' | '緑' | '黒' | '無';

export interface CardText {
  label: string;
  body: string;
}

export interface CardFaq {
  q: string;
  a: string;
}

export interface Card {
  cardID: string | null;
  productID: string | null;
  image: string;
  name: string;
  subName: string[];
  alias?: string[];
  rarity: string;
  illust: string;
  cardType: string[];
  lrigTypeClass: string[] | null;
  color: CardColor[];
  level: number | null;
  cost: Record<string, number> | null;
  power: number | null;
  timing: string[] | null;
  lifeBurst: boolean | null;
  text: CardText[];
  flavorText: string;
  faq: CardFaq[];
  tags: string[];
}
