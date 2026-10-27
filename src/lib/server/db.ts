import { newUserId } from './ids.js';

export interface UserRow {
  id: string;
  email: string | null;
  email_verified: number;
  password_hash: string | null;
  display_name: string;
  username: string | null;
  bluesky_did: string | null;
  bluesky_handle: string | null;
  created_at: number;
  updated_at: number;
}

export class Db {
  private static readonly UPDATABLE_COLUMNS = new Set([
    'email',
    'email_verified',
    'password_hash',
    'display_name',
    'username',
    'bluesky_did',
    'bluesky_handle',
    'updated_at',
  ]);

  constructor(private d1: App.Platform['env']['DB']) {}

  async getUserById(id: string): Promise<UserRow | null> {
    return this.d1.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>();
  }

  async getUserByEmail(email: string): Promise<UserRow | null> {
    return this.d1.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>();
  }

  async getUserByDid(did: string): Promise<UserRow | null> {
    return this.d1
      .prepare('SELECT * FROM users WHERE bluesky_did = ?')
      .bind(did)
      .first<UserRow>();
  }

  async getUserByUsername(username: string): Promise<UserRow | null> {
    return this.d1
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first<UserRow>();
  }

  async getUserByHandle(handle: string): Promise<UserRow | null> {
    return this.d1
      .prepare('SELECT * FROM users WHERE bluesky_handle = ? COLLATE NOCASE')
      .bind(handle)
      .first<UserRow>();
  }

  async setUsername(id: string, username: string): Promise<boolean> {
    try {
      await this.d1
        .prepare('UPDATE users SET username = ?, updated_at = ? WHERE id = ?')
        .bind(username, Math.floor(Date.now() / 1000), id)
        .run();
      return true;
    } catch {
      return false;
    }
  }

  async createUser(user: Omit<UserRow, 'created_at' | 'updated_at'>): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.d1
      .prepare(
        `INSERT INTO users (id, email, email_verified, password_hash, display_name, username, bluesky_did, bluesky_handle, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        user.id,
        user.email,
        user.email_verified,
        user.password_hash,
        user.display_name,
        user.username,
        user.bluesky_did,
        user.bluesky_handle,
        now,
        now
      )
      .run();
  }

  async updateUser(id: string, fields: Partial<Omit<UserRow, 'id' | 'created_at'>>): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const entries = Object.entries({ ...fields, updated_at: now }).filter(([k]) =>
      Db.UPDATABLE_COLUMNS.has(k)
    );
    if (!entries.length) return;
    const set = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v);
    await this.d1
      .prepare(`UPDATE users SET ${set} WHERE id = ?`)
      .bind(...values, id)
      .run();
  }

  async upsertBlueskyUser(did: string, handle: string, displayName: string): Promise<UserRow> {
    const normalizedHandle = handle.trim().toLowerCase();

    await this.d1
      .prepare(
        'UPDATE users SET bluesky_handle = NULL WHERE bluesky_handle = ? COLLATE NOCASE AND bluesky_did != ?'
      )
      .bind(normalizedHandle, did)
      .run();

    const existing = await this.getUserByDid(did);
    if (existing) {
      await this.updateUser(existing.id, { bluesky_handle: normalizedHandle });
      return { ...existing, bluesky_handle: normalizedHandle };
    }
    const id = newUserId();
    await this.createUser({
      id,
      email: null,
      email_verified: 0,
      password_hash: null,
      display_name: displayName || normalizedHandle,
      username: null,
      bluesky_did: did,
      bluesky_handle: normalizedHandle,
    });
    return (await this.getUserById(id))!;
  }
}
