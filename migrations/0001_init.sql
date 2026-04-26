PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  bluesky_did TEXT UNIQUE,
  bluesky_handle TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_did ON users(bluesky_did);

CREATE TABLE email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
