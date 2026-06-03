export type CardColor = '白' | '赤' | '青' | '緑' | '黒' | '無';

/** カードテキスト1能力ぶん。label は【】を外した能力種別(常/自/出/起/LB/チーム自 等、無ければ '')、body は本文 */
export interface CardText {
  label: string;
  body: string;
}

/** FAQ 1件 */
export interface CardFaq {
  q: string;
  a: string;
}

/**
 * カード1枚の正規化スキーマ。
 * convert_cards.py が生データ(.txt)から生成する static/assets/cards_json/*.json と1:1で対応する。
 * 全フィールド常に存在し、欠損は null / [] で表現する(「あったりなかったり」を作らない)。
 */
export interface Card {
  /** カード番号 (例 WXDi-P12-010)。header.json の集約カードのみ null */
  cardID: string | null;
  /** 商品ID (例 WXDi-P12)。header のみ null */
  productID: string | null;
  /** R2配信用の相対パス: productID/cardID.webp */
  image: string;
  name: string;
  /** 検索用の読み(ひらがな)・略称 */
  subName: string[];
  rarity: string;
  /** イラストレーター。不明は '' */
  illust: string;
  /** カード種類 (ルリグ/アシスト/ピース/アーツ/シグニ/スペル/サーバント)。複数可(例 ['ピース','リレー']) */
  cardType: string[];
  /** ルリグタイプ/シグニクラス。無ければ null */
  lrigTypeClass: string[] | null;
  color: CardColor[];
  /** レベル(0-4)。無ければ null */
  level: number | null;
  /** コスト {色: 数}。ルリグ/アシストはグロウコスト、他はコスト、シグニ/サーバントは null */
  cost: Record<string, number> | null;
  power: number | null;
  /** 使用タイミング。無ければ null */
  timing: string[] | null;
  /** シグニは true/false、それ以外は null */
  lifeBurst: boolean | null;
  text: CardText[];
  flavorText: string;
  faq: CardFaq[];
  /** タグ(チーム所属など)。基本は [] */
  tags: string[];
}
