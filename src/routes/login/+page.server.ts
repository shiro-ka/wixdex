import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ctx, getAppUrl } from '$lib/server/context';
import { createSession } from '$lib/server/auth';
import { hashPassword, verifyPassword, needsRehash } from '$lib/server/password';
import { checkRateLimit, incrementRateLimit } from '$lib/server/rate-limit';
import { sendEmail, passwordResetEmail } from '$lib/server/email';
import { generateResetToken, hashResetToken, RESET_TTL } from '$lib/server/passwordReset';
import { newUserId } from '$lib/server/ids';
import { validateUsername } from '$lib/utils/atName';
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
  return {
    oauthError: error ? (message ?? error) : null,
    // /reset 完了後の戻り先。成功メッセージ表示用。
    resetDone: url.searchParams.get('reset') === 'success',
  };
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

    // 旧パラメータ(回数少なめ)のハッシュなら、ログイン成功のついでに現行強度へ再保存。
    // 失敗してもログインは続行する(致命的でない)。
    if (needsRehash(user.password_hash)) {
      try {
        await db.updateUser(user.id, { password_hash: await hashPassword(password) });
      } catch {
        /* rehash 失敗は無視 */
      }
    }

    await createSession(cookies, env, store, {
      userId: user.id,
      email: user.email,
      displayName: user.display_name,
      username: user.username,
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

    // username はURLキーになるので専用バリデーション（予約語・文字種）。
    const usernameCheck = validateUsername(String(data.get('username') ?? ''));
    if (!usernameCheck.ok) {
      return fail(400, { mode: 'register', error: `ユーザー名: ${usernameCheck.error}` });
    }
    const username = usernameCheck.value;

    const { email, password, displayName } = parsed.data;

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return fail(409, { mode: 'register', error: 'このメールアドレスはすでに登録されています。' });
    }
    if (await db.getUserByUsername(username)) {
      return fail(409, { mode: 'register', error: 'このユーザー名はすでに使われています。' });
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
      username,
      bluesky_did: null,
      bluesky_handle: null,
    });

    await createSession(cookies, env, store, {
      userId: id,
      email,
      displayName,
      username,
      blueskyDid: null,
      blueskyHandle: null,
    });

    redirect(302, '/');
  },

  // パスワード再設定メールの送信リクエスト。
  // アカウントの有無に関わらず常に同じ成功応答を返す(存在を漏らさない)。
  forgotPassword: async (event) => {
    const { request, getClientAddress } = event;
    const { env, store, db } = ctx(event);
    const ip = getClientAddress();

    const { allowed } = await checkRateLimit(store, ip, 'pwreset');
    if (!allowed) {
      return fail(429, { mode: 'forgot', error: 'リクエストが多すぎます。15分後に再試行してください。' });
    }
    await incrementRateLimit(store, ip, 'pwreset');

    const data = await request.formData();
    const parsed = z.string().email().safeParse(String(data.get('email') ?? '').trim());

    // メール形式が妥当 かつ パスワード持ちのアカウントが存在する時だけ送信。
    // それ以外でも応答は同じ(成功)にして、登録の有無を判別させない。
    if (parsed.success) {
      const user = await db.getUserByEmail(parsed.data);
      if (user?.password_hash) {
        const userId = user.id;
        const email = parsed.data;
        // トークン保存とメール送信はバックグラウンドで実行し、応答時間をアカウント有無で揃える
        // （存在する時だけ送信完了を待つと、その遅延で存在を推測されるため）。
        const job = (async () => {
          const token = generateResetToken();
          await store.setPasswordReset(await hashResetToken(token), userId, RESET_TTL);
          await sendEmail(env, email, passwordResetEmail(`${getAppUrl(env)}/reset/${token}`));
        })().catch((err) => console.error('[forgotPassword] 背景処理失敗:', err));
        // 本番(Pages)は waitUntil で worker を生かして完走させる。
        // ローカルは context が無くても floating promise として完走する。
        event.platform?.context?.waitUntil?.(job);
      }
    }

    return { mode: 'forgot', success: true };
  },
};
