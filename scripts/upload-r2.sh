#!/usr/bin/env bash
# R2 バケットにカード画像を一括アップロードする
# 使い方: bash scripts/upload-r2.sh
#
# 前提:
#   - wrangler login 済み (または CLOUDFLARE_API_TOKEN 環境変数セット済み)
#   - wrangler r2 bucket create wixdex-card-images 実行済み

set -euo pipefail

BUCKET="wixdex-card-images"
IMG_DIR="static/assets/cards_img"
TOTAL=0
FAILED=0

echo "Uploading card images to R2 bucket: $BUCKET"

while IFS= read -r -d '' file; do
  key="${file#$IMG_DIR/}"
  # カード画像はファイル名で一意＝中身は不変。長期 immutable キャッシュにして
  # ブラウザの再検証(条件付きGET/304の往復)を止める。Cache-Control が無いと
  # モバイルでモーダルを開くたびに再検証が走り、画像表示が1秒近く遅れる。
  if npx wrangler r2 object put "$BUCKET/$key" --file="$file" --content-type="image/webp" --cache-control="public, max-age=31536000, immutable" --remote 2>/dev/null; then
    TOTAL=$((TOTAL + 1))
    echo "  ✓ $key"
  else
    FAILED=$((FAILED + 1))
    echo "  ✗ $key (failed)"
  fi
done < <(find "$IMG_DIR" -name "*.webp" -print0 | sort -z)

echo ""
echo "Done: $TOTAL uploaded, $FAILED failed"
