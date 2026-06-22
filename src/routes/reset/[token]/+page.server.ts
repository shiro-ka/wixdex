import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';
import { hashResetToken } from '$lib/server/passwordReset';
import { hashPassword } from '$lib/server/password';
import { checkRateLimit, incrementRateLimit } from '$lib/server/rate-limit';
import { z } from 'zod';

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) redirect(302, '/');
  const { store } = ctx(event);
  const record = await store.getPasswordReset(await hashResetToken(event.params.token));
  return { valid: !!record };
};

export const actions: Actions = {
  default: async (event) => {
    const { store, db } = ctx(event);
    const ip = event.getClientAddress();

    const { allowed } = await checkRateLimit(store, ip, 'pwreset-confirm');
    if (!allowed) {
      return fail(429, { error: 'リクエストが多すぎます。しばらく待ってから試してください。' });
    }

    const tokenHash = await hashResetToken(event.params.token);
    const record = await store.getPasswordReset(tokenHash);
    if (!record) {
      await incrementRateLimit(store, ip, 'pwreset-confirm');
      return fail(400, {
        error: 'リンクが無効か期限切れです。お手数ですが再度お試しください。',
        expired: true,
      });
    }

    const data = await event.request.formData();
    const parsed = z.string().min(8).max(128).safeParse(data.get('password'));
    if (!parsed.success) {
      return fail(400, { error: 'パスワードは8文字以上で入力してください。' });
    }

    await db.updateUser(record.userId, { password_hash: await hashPassword(parsed.data) });
    await store.delPasswordReset(tokenHash); // 単回使用

    redirect(303, '/login?reset=success');
  },
};
