import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, needsRehash } from './password';

// 任意の反復回数で保存形式 (pbkdf2$sha256$<iter>$<salt>$<hash>) の文字列を作る。
// 旧パラメータのハッシュを再現して後方互換を検証するため。
async function makeHash(password: string, iterations: number): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations, hash: 'SHA-256' },
    key,
    256
  );
  const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `pbkdf2$sha256$${iterations}$${b64(salt.buffer as ArrayBuffer)}$${b64(bits)}`;
}

describe('password', () => {
  it('hash→verify が一致する', async () => {
    const h = await hashPassword('correct horse battery staple');
    expect(await verifyPassword('correct horse battery staple', h)).toBe(true);
  });

  it('誤ったパスワードは false', async () => {
    const h = await hashPassword('correct horse battery staple');
    expect(await verifyPassword('wrong password', h)).toBe(false);
  });

  it('旧パラメータ(200000回)のハッシュも検証できる(後方互換)', async () => {
    const old = await makeHash('legacy-pw', 200_000);
    expect(await verifyPassword('legacy-pw', old)).toBe(true);
    expect(await verifyPassword('nope', old)).toBe(false);
  });

  it('壊れた/不正な形式は false', async () => {
    expect(await verifyPassword('x', 'garbage')).toBe(false);
    expect(await verifyPassword('x', 'pbkdf2$sha256$abc$salt$hash')).toBe(false);
    expect(await verifyPassword('x', 'bcrypt$sha256$600000$s$h')).toBe(false);
  });

  it('needsRehash: 旧回数は true / 現行は false / 不正形式は true', async () => {
    const old = await makeHash('pw', 200_000);
    const fresh = await hashPassword('pw');
    expect(needsRehash(old)).toBe(true);
    expect(needsRehash(fresh)).toBe(false);
    expect(needsRehash('garbage')).toBe(true);
  });
});
