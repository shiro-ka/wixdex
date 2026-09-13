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
  /**
   * 公式の読み(ひらがな)。公式ページから機械的に取れる列で、再生成のたびに丸ごと上書きしてよい。
   * カード名の下に小さく表示される。
   */
  subName: string[];
  /**
   * 手で足した検索語(略称・表記ゆれ)。★機械では復元できないので再生成で絶対に触らないこと。
   * 必要なカードにしか生えない(2272枚中54枚)。検索専用で、表示には出さない。
   */
  alias?: string[];
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
  /**
   * タグ。タグ検索はこれだけを見る（他の項目から分かることも書き写してある）。種類は3つ:
   * チーム（No Limit 等）/ キーワード（アタックフェイズ・ディソナ・チームピース・ゲート・ライズ）/
   * クラス（そのクラスのサポート能力を持つ。本文に <クラス名> が出る）。
   * 一覧と種類は同じディレクトリの tags.json。付かないカードは []
   */
  tags: string[];
}
