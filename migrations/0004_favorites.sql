CREATE TABLE favorites (
  user_id   TEXT    NOT NULL,
  card_id   TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, card_id)
);
CREATE INDEX idx_favorites_user ON favorites(user_id);
