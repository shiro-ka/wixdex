# 引き継ぎ: APK版でカードモーダルの画像表示が遅い

作成日: 2026-06-24 / 引き継ぎ先: PC開発チーム
担当(モバイル側): スマホで開発中のためR2再アップロード等のPC作業ができず、ここで引き継ぎ。

---

## 1. 問題 (Issue)

**APK(TWA)版で、カードをタップしてモーダルを開くと、枠は出るが画像表示まで1秒近くかかる。**

- PCブラウザでは爆速(開いた瞬間に画像が出ている)。問題はAPK(実機WebView)だけ。
- カードリスト(グリッド)の画像は普通に読み込めている。
- ストレージ＆キャッシュをクリアして再現確認済み。

## 2. 環境・再現条件

- フロント: SvelteKit + Svelte5 / Cloudflare Pages
- カード画像: R2バケット `wixdex-card-images`、公開URL `https://pub-eaed63f9ee4b4b0e806344bd5b464e65.r2.dev/...`
  - 形式: WebP (VP8X)、例 `WX24-P1/WX24-P1-001.webp` = 869×1213px / 約141KB
- リスト画像: `LazyImage.svelte`(`decoding="async"` + `crossorigin="anonymous"`)
- モーダル画像: `CardPopup.svelte`(`decoding="sync"` + `fetchpriority="high"` + `crossorigin="anonymous"`)
- SWキャッシュ: `vite.config.ts` の workbox runtimeCaching で r2.dev を `CacheFirst`

## 3. 計測データ(これが決定的)

R2画像レスポンスヘッダを `Origin` 付き(=ブラウザのcrossorigin相当)で実測:

```
$ curl -sI -H "Origin: https://wixdex.cards" \
  https://pub-eaed63f9ee4b4b0e806344bd5b464e65.r2.dev/WX24-P1/WX24-P1-001.webp

HTTP/1.1 200 OK
Content-Type: image/webp
Content-Length: 141072
Access-Control-Allow-Origin: *
ETag: "c333cc2eb73c16029d34f8cb62d4e15b"
Vary: Origin
```

**注目点:**
- `Cache-Control` が**無い**(ETagのみ、Last-Modified/Expiresも無し)。
- `Vary: Origin` 付き。

## 4. 考察 (根本原因)

### 主因: `Cache-Control` 不在 → 毎回再検証

`Cache-Control`(やLast-Modified)が無いと、ブラウザはそのリソースを「鮮度不明」として扱い、
**URLを再利用するたびに条件付きGET(If-None-Match → 304)で再検証する**。
モバイル回線ではこの往復が数百ms〜1秒。

- **リスト**: 一度描画した `<img>` 要素が生き続けるので、その要素は再検証しない → 速いまま。
- **モーダル**: 開くたびに**新しい `<img>` 要素**を生成 → HTTPキャッシュ経由で再検証が走る → 1秒。
- さらにモーダルは `decoding="sync"` なので、その往復が終わるまで**モーダルの描画自体をブロック** →
  「枠だけ先に出て、1秒後に画像」という体感になる。

「リストは読めてるからネットワークじゃない」は惜しい誤読で、
正しくは **"キャッシュが効かず毎回再検証している"**。1MPのWebPデコードは弱CPUでも数十msで、1秒の説明にはならない(デコード説は棄却)。

### 副因: `Vary: Origin` がSWキャッシュのマッチを外しうる

workbox `CacheFirst` の `cache.match()` は既定で `Vary` を尊重する。`Vary: Origin` 付きだと
Originヘッダの差でキャッシュヒットせず、毎回ネットワークに行く可能性がある(SWが効いていれば
CacheFirstは再検証しないので本来は速いはず → 効いていない疑い)。

## 5. やったこと (このブランチで実施済み・コミット済み)

3点とも**コミット済み**(working tree clean)。①は再アップロードしないと既存オブジェクトに反映されない点に注意。

1. **`scripts/upload-r2.sh`** — アップロード時に `Cache-Control` を付与(本丸)
   ```diff
   - npx wrangler r2 object put "$BUCKET/$key" --file="$file" --content-type="image/webp" --remote
   + npx wrangler r2 object put "$BUCKET/$key" --file="$file" --content-type="image/webp" \
   +   --cache-control="public, max-age=31536000, immutable" --remote
   ```
   カード画像はファイル名で一意=中身不変なので1年immutableでOK。

2. **`vite.config.ts`** — SWのカード画像キャッシュに `matchOptions: { ignoreVary: true }` を追加。
   `Vary: Origin` でキャッシュマッチが外れるのを防止。

3. **`src/routes/+page.svelte`** — 効果のなかったプリデコード(`openCardPopup` の `Image.decode()` 温め)を撤去。
   `CardPopup.svelte` の `decoding="sync"` は維持(キャッシュが効けば「開いた瞬間」になるため)。

## 6. だめだったこと (試したが効かなかった/誤りだった)

- **プリデコード仮説(撤去済み)**: タップ時に裏で `Image.decode()` して温めてから開く、を実装したが
  APKで改善せず。→ デコードではなくネットワーク往復が原因だったため当然。`Promise.race` の400ms
  タイムアウトでむしろモーダル表示を最大400ms遅らせていた。撤去済み。
- **`decoding="sync"` 単体**: PCでは爆速化に成功したが、APKでは再検証の往復をブロックするため逆効果だった
  (原因が判明した今は、キャッシュさえ効けばsyncのままで良い、と判断)。

## 7. 対策 (まとめ)

| 対策 | 効果 | 画像ファイル要否 | 状態 |
|---|---|---|---|
| ① R2に `Cache-Control: ...immutable` を焼く | **本丸**。HTTPキャッシュが再検証せず即配信。SW非経由・クローラ・初回も含め全部速くなる | **必要**(PCローカルの画像) | スクリプト修正済み、**再実行が必要** |
| ② SW `ignoreVary: true` | 保険。SW経由なら再検証なしで即ヒット | 不要(コードのみ) | コミット済み、デプロイで反映 |

## 8. PC開発チームがやるべきこと (アクション)

1. **このブランチを pull**(①②③のコミット入り)。
2. **`bash scripts/upload-r2.sh` を再実行**して、R2の全カード画像を `Cache-Control` 付きで上げ直す。
   - 前提: `wrangler login` 済み or `CLOUDFLARE_API_TOKEN` セット済み、`static/assets/cards_img/` に画像があること。
   - `put` は上書きなので既存オブジェクトに `Cache-Control` が焼かれる(バイトも再送される)。
3. **デプロイ**(②のSW変更を本番へ)。
4. **APK実機で検証**: ストレージ&キャッシュをクリア → アプリ再起動 → カードをタップして
   モーダル画像が即表示されるか確認。

### 補足: 再アップロードせずにCache-Controlを付けたい場合
`pub-xxx.r2.dev` の管理URLのままでは Cloudflare の Cache Rules が効かない。
カスタムドメインをR2バケットに割り当てれば、Cache Rules / Transform Rules でエッジから
`Cache-Control` を付与できる(再アップロード不要)。ただし `VITE_CARD_IMAGE_BASE_URL` の
変更とドメイン設定が必要なので、まずは ①(再アップロード)が一番ラク。

## 9. それでもまだ遅い場合の次の一手 (診断)

実機Chromeをリモートデバッグ(`chrome://inspect`)で繋ぎ、Networkタブで**モーダルを開いた瞬間の
カード画像リクエスト**を観察:

- **`(disk cache)` / `(ServiceWorker)` でサイズが出て時間≒0** → 解決。
- **`304 Not Modified` が出て数百ms〜** → まだ再検証している。①のCache-Controlが効いていない
  (再アップロード漏れ / TTL設定ミス / CDN側で剥がされている)を疑う。レスポンスヘッダに
  `Cache-Control: public, max-age=31536000, immutable` が乗っているか確認。
- **`200` でフル取得している** → SWが効いておらず、HTTPキャッシュも効いていない。SWの登録状況
  (`navigator.serviceWorker.controller` がnullでないか)と、`Vary` 周りを確認。

## 10. 関連ファイル

- `src/lib/components/CardPopup.svelte` — モーダル(`decoding="sync"` の `<img>`)
- `src/lib/components/LazyImage.svelte` — リスト画像(`decoding="async"`)
- `src/lib/utils/cardImages.ts` — `cardImageUrl()`(リスト/モーダル共通のURL生成)
- `vite.config.ts` — workbox runtimeCaching(r2.dev = CacheFirst)
- `scripts/upload-r2.sh` — R2アップロードスクリプト
