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
  if npx wrangler r2 object put "$BUCKET/$key" --file="$file" --content-type="image/webp" 2>/dev/null; then
    TOTAL=$((TOTAL + 1))
    echo "  ✓ $key"
  else
    FAILED=$((FAILED + 1))
    echo "  ✗ $key (failed)"
  fi
done < <(find "$IMG_DIR" -name "*.webp" -print0 | sort -z)

echo ""
echo "Done: $TOTAL uploaded, $FAILED failed"
