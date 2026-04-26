CREATE TABLE card_usage_aggregate (
  card_id TEXT PRIMARY KEY,
  deck_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  last_updated INTEGER NOT NULL
);
CREATE INDEX idx_card_usage_total ON card_usage_aggregate(total_count DESC);
CREATE INDEX idx_card_usage_deck ON card_usage_aggregate(deck_count DESC);
