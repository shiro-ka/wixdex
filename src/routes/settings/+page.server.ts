import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ctx } from '$lib/server/context';
import { refreshSession } from '$lib/server/auth';
import { hashPassword, verifyPassword } from '$lib/server/password';
import { revokeOAuthSession } from '$lib/server/oauth';
import { validateUsername } from '$lib/utils/atName';
import { z } from 'zod';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/login');
  return { user: locals.user };
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const actions: Actions = {
  // ユーザー名(URLキー)の変更。メアド勢向け。
  changeUsername: async (event) => {
    const { cookies, locals } = event;
    if (!locals.user) return fail(401, { error: 'ログインが必要です。', action: 'changeUsername' });

    const { db, store } = ctx(event);
    const data = await event.request.formData();
    const check = validateUsername(String(data.get('username') ?? ''));
    if (!check.ok) {
      return fail(400, { error: check.error, action: 'changeUsername' });
    }
    const username = check.value;

    // 他人が使っていたら不可。自分の現在値ならそのままOK。
    const owner = await db.getUserByUsername(username);
    if (owner && owner.id !== locals.user.id) {
      return fail(409, { error: 'このユーザー名はすでに使われています。', action: 'changeUsername' });
    }

    const ok = await db.setUsername(locals.user.id, username);
    if (!ok) {
      return fail(409, { error: 'このユーザー名はすでに使われています。', action: 'changeUsername' });
    }
    await refreshSession(cookies, store, { username });

    return { success: true, action: 'changeUsername' };
  },

  changePassword: async (event) => {
    const { request, locals } = event;
    if (!locals.user) return fail(401, { error: 'ログインが必要です。' });

    const { db } = ctx(event);
    const data = await request.formData();
    const parsed = changePasswordSchema.safeParse({
      currentPassword: data.get('currentPassword'),
      newPassword: data.get('newPassword'),
    });
    if (!parsed.success) {
      return fail(400, {
        error: '新しいパスワードは8文字以上で入力してください。',
        action: 'changePassword',
      });
    }

    const user = await db.getUserById(locals.user.id);
    if (!user) return fail(404, { error: 'ユーザーが見つかりません。', action: 'changePassword' });

    if (
      !user.password_hash ||
      !(await verifyPassword(parsed.data.currentPassword, user.password_hash))
    ) {
      return fail(401, {
        error: '現在のパスワードが正しくありません。',
        action: 'changePassword',
      });
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await db.updateUser(user.id, { password_hash: newHash });

    return { success: true, action: 'changePassword' };
  },

  unlinkBluesky: async (event) => {
    const { cookies, locals } = event;
    if (!locals.user) return fail(401, { error: 'ログインが必要です。' });
    if (!locals.user.email) {
      return fail(400, {
        error: 'メールアドレスが設定されていないため、Bluesky 連携を解除できません。',
        action: 'unlinkBluesky',
      });
    }

    const { env, store, db } = ctx(event);
    if (locals.user.blueskyDid) {
      await revokeOAuthSession(env, store, locals.user.blueskyDid);
    }
    await db.updateUser(locals.user.id, { bluesky_did: null, bluesky_handle: null });
    await refreshSession(cookies, store, { blueskyDid: null, blueskyHandle: null });

    return { success: true, action: 'unlinkBluesky' };
  },
};
