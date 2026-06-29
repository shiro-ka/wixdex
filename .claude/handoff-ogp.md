# 引き継ぎ: OGP対応

最終更新: 2026-06-29 / 引き継ぎ元: スマホ開発チーム → 引き継ぎ先: PC開発チーム

## ステータス

- **静的OGP: 対応済み**（`static/og.png` を作成・配置、メタ配線も完了）
- **動的OGP: 未着手**（PCチームへパス。理由は下記「PCチームに任せること」）

---

## 1. やったこと（静的OGP）

### 完了内容
- `static/og.png`（1200×630 / PNG / 約14KB / セーフエリア60px確保）を作成・配置。
  - これが無いと `og:image` が404だった。これで解消。
  - デザイン: ダーク背景 `#18181b` + オレンジ矢印ロゴ（`static/wixdex.png`）+ ワードマーク
    `wix`(白)/`dex`(オレンジ `#f97316`) + タグライン「WIXOSS デッキビルダー」(zinc-400)。
- **書体はUIと同一の `Zen Maru Gothic`**（丸ゴシック）で焼いた。UIの `src/app.css` / `src/app.html`
  が読んでいるのと同じフォント。
- メタタグ配線は元々完了済み（`src/app.html` の共通デフォルト + 各ページの `<svelte:head>` で
  og:title/description/url を上書き。OGPは同一プロパティ先勝ちなので可変部分だけ個別指定）。

### 生成方法（再生成したい時のため）
- この開発環境は **fontconfig が壊れている**ため、Pillow等の一般的なテキスト描画は不可
  （pipもネット制限で不可）。
- 回避策: **`sharp` の `text` 入力 + `fontfile` 直指定**でフォントファイルを明示的に渡すと、
  fontconfig を実質バイパスして描画できる（`Fontconfig error` ログは出るが非致命）。
- フォントは **Google Fonts の `&text=` サブセット機能**で「使う文字だけ」を取得して使った:
  `https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@700&text=wixdex`
  （woff2非対応のUAで叩くとTTFを返す。`url(...)` の中の `/l/font?kit=...` がTTF実体）。
  → wixdexワードマーク用(700)とタグライン用(500)の極小TTF(2KB/5KB)を取得して `sharp` に渡した。

---

## 2. 知見（重要・フォント問題の正体）

「動的OGPは日本語フォントが鬼門」と言われる理由を切り分けて記録する。フォントの話は**別々の2箇所**で出る:

1. **UIの文字** — `app.html` が Google Fonts から `Zen Maru Gothic` を `<link>` で読むだけ。ブラウザが
   描画するので何の問題もない。**既に動作中。**
2. **画像に文字を「焼く」とき（OGP）** — ここだけが難所:
   - サーバー/エッジ（Cloudflare）には**システムフォントが無い**。ブラウザと違い「Google Fonts読めば出る」
     が通用せず、**フォントファイルを自前で用意して描画エンジンに渡す**必要がある。
   - 日本語フォントは全文字入りだと数MB級でデカく、Workersのバンドル制限と相性が悪い。
   - 確認: クローラはJSを実行せず**SSR HTML**の `og:image`(ただのURL)を取りに来るだけ。中身が静的か
     動的かは問わない。`curl https://wixdex.cards/@user/deck | grep og:` でタグが出ているか確認可。
   - 各SNSはOGPを**強くキャッシュ**するので、差し替え時はデバッガ
     （X: cards-dev.twitter.com/validator, FB: developers.facebook.com/tools/debug）で再取得させる。

**結論: フォントを理由に動的OGPを諦める必要はゼロ。** UIと同じ `Zen Maru Gothic` を動的OGPでも使える
（下記の方法でフォントを供給するだけ）。

---

## 3. 動的OGPの方針（スマホ班と確定済み）

### スコープ（確定）
動的OGPに載せるのは **デッキタイトル + ロゴ + ユーザー名 だけ**でよい。
- カード画像はOGPの縮小表示では潰れて見えないので**載せない**。
- → レイアウトが単純なので実装が確実・低リスク。

### 実装パス（推奨: ①リクエスト時生成）
- **① リクエスト時生成 + キャッシュ**（推奨）
  - `satori`(レイアウト→SVG) + `resvg-wasm`(SVG→PNG)。OGP用エンドポイントを `+server.ts` で1個追加。
  - デッキ名/ユーザー名は **既存のD1(`DB`)から読む**（共有デッキは
    `src/routes/[username=atname]/[slug]/+page.server.ts` が既に同じデータを読んでいる、流用可）。
  - 生成結果は **Cache API か既存KV にキャッシュ**（同一デッキは2回目以降スキップ。クローラは1回踏むだけ）。
  - **R2バケットは不要**。adapter-cloudflareのサーバーランタイムは既に動いており、D1/KVもバインド済み
    （`wrangler.toml` 参照）なので、**新規のCFダッシュボード作業はほぼ不要＝デプロイのみ**。
  - フォント供給（UIと同じ `Zen Maru Gothic` を維持する2択）:
    - (a) リクエスト時に `&text=<デッキ名>` で必要グリフだけ取得 → satoriにBuffer渡し（軽量・毎回ネット依存）。
    - (b) Zen Maru Gothic の「常用漢字+かな」サブセット(数百KB〜)をリポジトリに同梱（ネット非依存・少し重い）。
  - 既知の動作ライブラリ: `workers-og` / `@cf-wasm/og` 系。resvg-wasmのCF動作・JPフォント周りだけ一度PoCを。
- **② 保存時生成 → R2**（今回は非推奨）
  - R2バケット作成 + 書き込みバインド + 認証が要る＝**CFガッツリ作業**。スコープが「タイトル+名前」だけなら
    ①で十分なので、わざわざR2を立てる必要はない。将来フルのデッキ画像をOGPに使いたくなったら再検討。

---

## 4. PCチームに任せること

1. **デプロイ**（静的og.pngを本番へ）。デプロイ後、X/FBのデバッガで `og:image` 表示確認＋キャッシュ再取得。
   - ※スマホ班の環境は **wrangler未セットアップ**のため、ここから先はPC側で。
2. **動的OGPの実装**（着手するなら）。上記「3. 方針」の①を軸に。スコープはタイトル+ロゴ+ユーザー名。
   - wrangler環境が整っているPC側でコード→ローカル `wrangler pages dev` 検証→デプロイ、が素直。

---

## 5. 関連ファイル
- `static/og.png` — 静的OGP画像（**対応済み**）
- `static/wixdex.png` — オレンジ矢印ロゴ（256×256, 文字なし）
- `src/app.html` — OGP共通デフォルト（og:image = https://wixdex.cards/og.png）/ UIフォントの `<link>`
- `src/app.css` — UIフォント定義（`Zen Maru Gothic`）
- `src/routes/+page.svelte` / `[username=atname]/+page.svelte` / `[username=atname]/[slug]/+page.svelte`
  — ページ個別の og:title/description/url
- `wrangler.toml` — D1(`DB`)・KV各種バインド済み（動的OGPのデータ読み出し/キャッシュに流用可）
