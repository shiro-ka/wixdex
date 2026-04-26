import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';
import { createSession } from '$lib/server/auth';
import { verifyPassword } from '$lib/server/password';
import { checkRateLimit, incrementRateLimit } from '$lib/server/rate-limit';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) redirect(302, '/');
  const error = url.searchParams.get('error');
  const message = url.searchParams.get('message');
  return { oauthError: error ? (message ?? error) : null };
};

export const actions: Actions = {
  default: async (event) => {
    const { request, cookies, getClientAddress } = event;
    const { env, store, db } = ctx(event);
    const ip = getClientAddress();

    const { allowed } = await checkRateLimit(store, ip, 'login');
    if (!allowed) {
      return fail(429, { error: 'ログイン試行が多すぎます。15分後に再試行してください。' });
    }

    const data = await request.formData();
    const parsed = schema.safeParse({
      email: data.get('email'),
      password: data.get('password'),
    });
    if (!parsed.success) {
      return fail(400, { error: 'メールアドレスとパスワードを入力してください。' });
    }

    const { email, password } = parsed.data;
    const user = await db.getUserByEmail(email);

    if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
      await incrementRateLimit(store, ip, 'login');
      return fail(401, { error: 'メールアドレスまたはパスワードが正しくありません。' });
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
};
