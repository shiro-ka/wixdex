-- メアド勢の公開URLキー(username)と、デッキ公開URLキー(slug)を追加。
-- bsky勢は username を持たず bluesky_handle で解決する（ドットの有無で名前空間を分離）。
-- 所有関係は従来どおり不変の id/user_id で握り、username/slug はURL表示用のラベルにすぎない。

ALTER TABLE users ADD COLUMN username TEXT;
-- username は小文字正規化して保存。NULL(=bsky勢)は重複可、設定済みのみ一意。
CREATE UNIQUE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
-- @ハンドル解決用（ハンドル変更時のスタガード/照合のため）。
CREATE INDEX idx_users_handle ON users(bluesky_handle);

ALTER TABLE decks ADD COLUMN slug TEXT;
-- slug はユーザー内で一意。NULLは重複可（移行直後の保険）。
CREATE UNIQUE INDEX idx_decks_user_slug ON decks(user_id, slug) WHERE slug IS NOT NULL;
-- 既存デッキは内部idをそのまま初期slugにしておく（後からユーザーが変更可能）。
UPDATE decks SET slug = id WHERE slug IS NULL;
