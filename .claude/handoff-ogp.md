# 引き継ぎ: OGP対応

作成日: 2026-06-24 / 引き継ぎ先: PC開発チーム(画像デザインが必要なため)
方針(確定済み): **まず静的OGP→後で動的**。リリース優先で確実に埋める。

---

## 0. TL;DR(PCチームが今やること)

1. **`static/og.png`(1200×630 / PNG)を作って置く** ← これが無いと現状 og:image が404。最優先。
2. デプロイして、X(Twitter) Card Validator / 各SNSのデバッガで表示確認。
3. (任意・後回し)動的OGP。下の「動的OGP」セクション参照。

---

## 1. 現状 (実装済み・コミット済み)

メタタグの配線は**全部完了**している。足りないのは**画像ファイル `static/og.png` だけ**。

### 共通デフォルト: `src/app.html`
```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="wixdex" />
<meta property="og:image" content="https://wixdex.cards/og.png" />   ← この実体が未配置(404)
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="wixdex — WIXOSS デッキビルダー" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://wixdex.cards/og.png" />  ← 同上
```

### ページ個別(og:title / og:description / og:url)
OGPは「同一プロパティは先勝ち」なので、可変部分は各ページの `<svelte:head>` に置いてある:
- `src/routes/+page.svelte`(ホーム)
- `src/routes/[username=atname]/+page.svelte`(プロフィール) — `{displayName} (@{atName}) — wixdex`
- `src/routes/[username=atname]/[slug]/+page.svelte`(共有デッキ) — `{deck.name} — wixdex`

→ **og:image は全ページ共通で `static/og.png` を使う**(個別指定していない)。

## 2. やるべきこと: 静的OGP画像 `static/og.png`

`static/` 直下に置くだけで `https://wixdex.cards/og.png` で配信され、即反映される。

### 仕様
- ファイル: **`static/og.png`**
- サイズ: **正確に 1200×630px**(OGP標準。これ以外だと切れる/弾かれる)
- 形式: PNG(JPGでも可)、容量目安 **300KB以下**
- セーフエリア: 端から **60px** は余白に(SNSの角丸/トリミング対策)

### デザイン指針(`static/wixdex.png` のロゴはオレンジの矢印アイコンのみ、文字なし)
- 背景: ダーク `#18181b`(アプリのテーマ色と統一)
- ワードマーク: `wix`(白)+`dex`(オレンジ `#f97316` 系)
- ロゴ: 既存のオレンジ矢印アイコン
- タグライン: 「WIXOSS デッキビルダー」
- ※あくまで指針。デザインはチームの裁量でOK。

## 3. 確認方法

デプロイ後:
- X(Twitter): https://cards-dev.twitter.com/validator
- Facebook/OGP全般: https://developers.facebook.com/tools/debug/
- 各SNSはOGPを**強くキャッシュする**ので、画像差し替え時はデバッガで再取得させること。
- クローラはJSを実行せず**SSRのHTML**しか読まない。SvelteKitはSSRするので `<svelte:head>` の
  タグはHTMLに出ている(確認は `curl https://wixdex.cards/@user/deck | grep og:`)。

---

## 4. 動的OGP(後回し / 知見の引き継ぎ)

現状は全ページ同じ `og.png`。将来は「デッキ共有リンクならそのデッキ名」「プロフィールならユーザー名」を
画像に焼きたい、という要望がある。**まだ着手しない**が、調査済みの結論を残す。

### OGPの仕組みとフォント問題(なぜ難しいか)
- クローラはSSR HTMLの `og:image`(ただのURL)を取りに来るだけ。中身が静的か動的かは問わない。
- 動的に画像を作る = サーバー/エッジで画像を生成する必要があるが、**エッジ環境にはシステムフォントが無い**
  (この開発環境でも fontconfig が壊れていてテキストが描画できなかった)。日本語フォントは4〜16MBあり
  Workersのバンドル制限とも相性が悪い。これが「動的OGPでフォントが鬼門」と言われる理由。

### 現実的な2つの実装パス(どちらも実現可能)
1. **リクエスト時生成 + 動的サブセット**(`@vercel/og` 系)
   - `satori`(レイアウト→SVG)+ `resvg-wasm`(SVG→PNG)。
   - **描画する文字だけ**をGoogle Fonts動的サブセットAPIから都度取得(数十KB)→ satoriにBuffer渡し。
   - 結果を Cache API / KV にキャッシュ(同一デッキは2回目以降スキップ。クローラは1回踏むだけ)。
   - 注意: 初回は数百ms、フォント取得がネットワーク依存、resvg-wasm初期化コスト。
2. **保存時に事前生成 → R2**(wixdex向けにはこちらが筋が良い)
   - wixdexは**既にクライアント側canvasで完璧なデッキ画像を生成できている**ので、デッキ保存時に
     その画像をR2へ上げ、`og:image` をそのURLにするだけ。**サーバーのフォント問題ゼロ**・生成失敗リスクほぼゼロ・
     クローラには静的画像で爆速。
   - プロフィール(ユーザー名だけ載せたい等)、保存時生成でカバーしづらいページは①を部分採用するハイブリッドも可。

### 推奨
リリースは静的`og.png`で十分。動的は②(保存時→R2、既存canvas流用)を軸に、必要なページだけ①、が低リスク。

---

## 5. 関連ファイル
- `src/app.html` — OGP共通デフォルト
- `src/routes/+page.svelte` / `[username=atname]/+page.svelte` / `[username=atname]/[slug]/+page.svelte` — ページ個別の og:title/description/url
- `static/` — ここに `og.png` を置く(未配置)
