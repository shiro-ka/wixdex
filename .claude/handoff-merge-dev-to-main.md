# 引き継ぎ TODO: dev → main マージ（ブランチ運用テスト）

作成: 2026-07-07 / 引き継ぎ元: 外出先リモコン班（Claude） → 引き継ぎ先: 自宅開発班

## 目的

開発ブランチを分けて（dev=preview / main=production）以降、まだ **dev→main マージ→本番デプロイ**の
一連の流れをテストしていない。これを実際に流して運用フローを検証する。

## 現状スナップショット（2026-07-07 時点）

- `origin/dev` は `origin/main` の **7コミット先行**、逆方向の差分は 0 → **fast-forward 可能なクリーン状態**。
- 先行7コミットの内訳:
  - `f01ef68` インフラ: staging(preview)環境を追加
  - `62a27dc` staging の APP_URL を dev.wixdex.pages.dev に変更
  - `aedad94` カードモーダル操作バー: 枚数表示も flex-1 で等分に
  - `2a5ec08` プルリフレッシュ(上引っ張りの誤更新)を抑止
  - `8b2bad9` 詳細検索3兄弟: スマホ未開時に全て非アクティブ背景へ
  - `7053b8b` 詳細検索3兄弟: アクティブ判定を activeDropdown 一本に統一
  - `88ccbbb` ルートページの og:url を動的origin に統一
- **マイグレーション変更なし** → 本番 D1(`wixdex-prod`) のスキーマは無変更。CI の `d1 migrations apply` は空振り(no-op)。
- 変更内容は staging インフラ整備＋UI修正のみ。本番に載せて問題なし。

## 進め方: PR経由（main はブランチ保護済み → 直push 不可）

main に保護をかけたので、必ず Pull Request 経由でマージする。

### 手順（自宅で Claude と）

1. 最新化: `git fetch --all --prune`（`origin/dev` が上記より進んでいたら差分を再確認）。
2. PR 作成（`gh` が使えるなら）:
   ```
   gh pr create --base main --head dev \
     --title "dev → main: staging環境整備 + UI修正一式" \
     --body "ブランチ運用テスト。マイグレーション変更なし・本番DBスキーマ無変更。"
   ```
   `gh` が無ければ GitHub UI で dev の「Compare & pull request」から base=main / compare=dev で作成。
3. CI（`deploy.yml`）の dev プレビュー結果と、PR のチェックが緑になるのを確認。
4. マージ（`gh pr merge --merge` もしくは UI の Merge ボタン）。
   - ff 可能なので `--merge`（マージコミット）でも `--rebase` でも可。運用の好みで決める。

### マージすると自動で起きること（`.github/workflows/deploy.yml`）

`push: branches: [main]` トリガーで:
1. `npm ci` → `npm run build`
2. **本番 D1 にマイグレーション適用**（今回は no-op）
3. **Cloudflare Pages 本番デプロイ → https://wixdex.cards**（実ユーザーに即公開）

## デプロイ後の確認（本番）

- https://wixdex.cards が正常表示。
- 今回のUI修正の目視確認:
  - カードモーダル下部の操作バーが等分（枚数コンテナも均等幅）。
  - スマホで上から引っ張ってもプルリフレッシュが起きない（Chrome/Firefox）。
  - 詳細検索3兄弟: スマホ未開時は3つとも通常背景 / 開いたものだけ明るい。PCは常にどれか明るい。
  - ルートを各SNSデバッガに通して OGP カードが出る（X: cards-dev.twitter.com/validator）。
- 問題があれば dev で直して再度 PR。

## 追記(2026-07-07): ベータ前リファクタ完了 + 判断待ち1件

ツール側(サイトルート `/`)の最終リファクタパスを実施済み。dev は svelte-check 0 errors /
test 45/45 でグリーン。追加コミット: `3633990f`(データ整合/サーバ堅牢化/モバイルUX一括) /
`93b91c88`(デッキセル安定キー & タッチ領域拡大) / `37ba0ddf`(password テスト修正)。

### ★ 自宅班への判断依頼: Sv5(レート制限の原子化)を見送りでよいか
- ログイン等のレート制限は `store.incrRate` が KV の read-modify-write で**意図的に非原子**
  (コードに「non-atomic — eventual consistency acceptable」と明記)。
- 「increment-first」に変えても KV では原子性が得られず、かつ「失敗時のみカウント」を壊して
  **成功ログインもカウント→正規ユーザーをロック**する副作用が出る。→ バンドエイドなので今回見送り。
- **提案**: 濫用が観測されたら Durable Objects 版レート制限を正式リリース枠で導入。この方針でクローズしてよいか判断を。

### ★ マージ前に staging で実機スモークテスト推奨
特に致命バグ修正(cloudDeckSync のデッキ複製)は静的レビューのみ。実際に staging で
「デッキ保存→再訪(下書き復元)→一覧を開かず再保存」して**複製されない(更新される)こと**を確認してから main へ。

### 見送った他の項目(post-beta backlog)
モーダルのEscキー閉じ/フォーカス制御(キーボードショートカット機能で一括)、
card_usage_aggregate の write-skew、username-check のレート制限。詳細はエージェントのメモリ
`post-beta-backlog` 参照(自宅で Claude を起動すれば MEMORY.md 経由で自動的に見える)。

## メモ

- 外出先リモコン環境は Node 未インストール & git 操作不可のため、ここまでの検証は静的レビューのみ。
  自宅環境では `npm ci` 後に `npm run check`（svelte-check）/ `npm test` を回してから流すと安心。
  (※ 外出先環境にも後から Node 22 をユーザー空間に導入済みなので、今後はその場で check/test 可能)
