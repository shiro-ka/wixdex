CREATE TABLE decks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  memo TEXT NOT NULL DEFAULT '',
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_decks_user ON decks(user_id, updated_at DESC);

CREATE TABLE deck_cards (
  deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  slot TEXT NOT NULL,
  card_id TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (deck_id, slot, card_id)
);
CREATE INDEX idx_deck_cards_card ON deck_cards(card_id);
