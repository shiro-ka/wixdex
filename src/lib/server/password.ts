const ITERATIONS = 100_000;
const HASH_ALGO = 'SHA-256';
const PREFIX = `pbkdf2$sha256$${ITERATIONS}`;

function encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function decode(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export async function hashPassword(password: string): Promise<string> {
  const saltArr = new Uint8Array(16);
  crypto.getRandomValues(saltArr);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltArr.buffer as ArrayBuffer, iterations: ITERATIONS, hash: HASH_ALGO },
    key,
    256
  );
  return `${PREFIX}$${encode(saltArr.buffer as ArrayBuffer)}$${encode(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') return false;
  const iterations = Number(parts[2]);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;
  const saltBytes = decode(parts[3]);
  const expectedHash = decode(parts[4]);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes.buffer as ArrayBuffer, iterations, hash: HASH_ALGO },
    key,
    256
  );
  const hashBytes = new Uint8Array(hash);
  if (hashBytes.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hashBytes.length; i++) {
    diff |= hashBytes[i] ^ expectedHash[i];
  }
  return diff === 0;
}

export function needsRehash(stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') return true;
  const iterations = Number(parts[2]);
  return !Number.isInteger(iterations) || iterations < ITERATIONS;
}
