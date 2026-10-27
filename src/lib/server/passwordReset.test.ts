import { describe, it, expect } from 'vitest';
import { generateResetToken, hashResetToken } from './passwordReset';

describe('passwordReset', () => {
  it('generateResetToken は URL-safe で十分な長さ、毎回ユニーク', () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(40);
    expect(a).not.toBe(b);
  });

  it('hashResetToken は決定的(同じトークン→同じハッシュ)', async () => {
    const token = generateResetToken();
    expect(await hashResetToken(token)).toBe(await hashResetToken(token));
  });

  it('異なるトークンは異なるハッシュ', async () => {
    expect(await hashResetToken('aaa')).not.toBe(await hashResetToken('bbb'));
  });

  it('ハッシュは元トークンと一致しない(平文を保存しない保証)', async () => {
    const token = generateResetToken();
    expect(await hashResetToken(token)).not.toBe(token);
  });
});
