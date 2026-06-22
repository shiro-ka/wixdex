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

  /** メアド勢の公開URLキー。username は小文字正規化済みで渡すこと。 */
  async getUserByUsername(username: string): Promise<UserRow | null> {
    return this.d1
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first<UserRow>();
  }

  /** bsky勢の公開URLキー。ハンドルは大小無視で照合。 */
  async getUserByHandle(handle: string): Promise<UserRow | null> {
    return this.d1
      .prepare('SELECT * FROM users WHERE bluesky_handle = ? COLLATE NOCASE')
      .bind(handle)
      .first<UserRow>();
  }

  /**
   * username を設定/変更。呼び出し側で検証・正規化済みの値を渡すこと。
   * 一意制約違反時は false（既に使われている）。
   */
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
    const entries = Object.entries({ ...fields, updated_at: now });
    const set = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v);
    await this.d1
      .prepare(`UPDATE users SET ${set} WHERE id = ?`)
      .bind(...values, id)
      .run();
  }

  async upsertBlueskyUser(did: string, handle: string, displayName: string): Promise<UserRow> {
    // ハンドルは小文字正規化して保存（@解決は大小無視だが保存は揃える）。
    const normalizedHandle = handle.trim().toLowerCase();

    // 旧ハンドルを手放した別ユーザーがこのハンドルを保持したままだと @解決が衝突する。
    // bsky上はある瞬間ハンドルは一意なので、自分以外の同名ハンドルは古い＝クリアしてよい。
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
