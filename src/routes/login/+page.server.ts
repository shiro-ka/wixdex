import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';
import { createSession } from '$lib/server/auth';
import { hashPassword, verifyPassword } from '$lib/server/password';
import { checkRateLimit, incrementRateLimit } from '$lib/server/rate-limit';
import { newUserId } from '$lib/server/ids';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(64),
});

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) redirect(302, '/');
  const error = url.searchParams.get('error');
  const message = url.searchParams.get('message');
  return { oauthError: error ? (message ?? error) : null };
};

export const actions: Actions = {
  // メールアドレス＋パスワードでログイン
  login: async (event) => {
    const { request, cookies, getClientAddress } = event;
    const { env, store, db } = ctx(event);
    const ip = getClientAddress();

    const { allowed } = await checkRateLimit(store, ip, 'login');
    if (!allowed) {
      return fail(429, {
        mode: 'login',
        error: 'ログイン試行が多すぎます。15分後に再試行してください。',
      });
    }

    const data = await request.formData();
    const parsed = loginSchema.safeParse({
      email: data.get('email'),
      password: data.get('password'),
    });
    if (!parsed.success) {
      return fail(400, { mode: 'login', error: 'メールアドレスとパスワードを入力してください。' });
    }

    const { email, password } = parsed.data;
    const user = await db.getUserByEmail(email);

    if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
      await incrementRateLimit(store, ip, 'login');
      return fail(401, {
        mode: 'login',
        error: 'メールアドレスまたはパスワードが正しくありません。',
      });
    }

    await createSession(cookies, env, store, {
      userId: user.id,
      email: user.email,
      displayName: user.display_name,
      blueskyDid: user.bluesky_did,
      blueskyHandle: user.bluesky_handle,
    });

    redirect(302, '/');
  },

  // メールアドレスで新規登録
  register: async (event) => {
    const { request, cookies, getClientAddress } = event;
    const { env, store, db } = ctx(event);
    const ip = getClientAddress();

    const { allowed } = await checkRateLimit(store, ip, 'signup');
    if (!allowed) {
      return fail(429, {
        mode: 'register',
        error: 'リクエストが多すぎます。しばらく待ってから試してください。',
      });
    }

    const data = await request.formData();
    const parsed = registerSchema.safeParse({
      email: data.get('email'),
      password: data.get('password'),
      displayName: data.get('displayName'),
    });
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(', ');
      return fail(400, { mode: 'register', error: `入力内容を確認してください: ${issues}` });
    }

    const { email, password, displayName } = parsed.data;

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return fail(409, { mode: 'register', error: 'このメールアドレスはすでに登録されています。' });
    }

    await incrementRateLimit(store, ip, 'signup');

    const id = newUserId();
    const passwordHash = await hashPassword(password);

    await db.createUser({
      id,
      email,
      email_verified: 0,
      password_hash: passwordHash,
      display_name: displayName,
      username: null, // Phase 2: 登録直後に username 決定フローへ誘導する
      bluesky_did: null,
      bluesky_handle: null,
    });

    await createSession(cookies, env, store, {
      userId: id,
      email,
      displayName,
      blueskyDid: null,
      blueskyHandle: null,
    });

    redirect(302, '/');
  },
};
