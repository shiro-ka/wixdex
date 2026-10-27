import { clearDraft } from './storage';

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {}
  clearDraft();
  window.location.href = '/';
}
