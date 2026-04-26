import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';
import { createSession } from '$lib/server/auth';
import { hashPassword } from '$lib/server/password';
import { checkRateLimit, incrementRateLimit } from '$lib/server/rate-limit';
import { newUserId } from '$lib/server/ids';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(64),
});

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(302, '/');
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    const { request, cookies, getClientAddress } = event;
    const { env, store, db } = ctx(event);
    const ip = getClientAddress();

    const { allowed } = await checkRateLimit(store, ip, 'signup');
    if (!allowed) {
      return fail(429, { error: 'リクエストが多すぎます。しばらく待ってから試してください。' });
    }

    const data = await request.formData();
    const parsed = schema.safeParse({
      email: data.get('email'),
      password: data.get('password'),
      displayName: data.get('displayName'),
    });
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(', ');
      return fail(400, { error: `入力内容を確認してください: ${issues}` });
    }

    const { email, password, displayName } = parsed.data;

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return fail(409, { error: 'このメールアドレスはすでに登録されています。' });
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
