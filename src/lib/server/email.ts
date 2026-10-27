import { getAppUrl } from './context.js';

interface MailContent {
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(
  env: App.Platform['env'],
  to: string,
  mail: MailContent
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY 未設定のため送信スキップ: "${mail.subject}" → ${to}`);
    return true;
  }
  const from = env.MAIL_FROM ?? `wixdex <noreply@${new URL(getAppUrl(env)).hostname}>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject: mail.subject, html: mail.html, text: mail.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('[email] Resend 送信失敗:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] Resend 送信例外:', err);
    return false;
  }
}

export function passwordResetEmail(resetUrl: string): MailContent {
  const subject = '【wixdex】パスワード再設定のご案内';
  const text =
    `wixdex のパスワード再設定リクエストを受け付けました。\n\n` +
    `下記リンクから新しいパスワードを設定してください（30分間有効）。\n${resetUrl}\n\n` +
    `このメールに心当たりがない場合は、何もせず破棄してください。パスワードは変更されません。`;
  const html =
    `<div style="font-family:sans-serif;line-height:1.7;color:#1a1a1a">` +
    `<h2 style="margin:0 0 12px">パスワード再設定</h2>` +
    `<p>wixdex のパスワード再設定リクエストを受け付けました。<br>下記ボタンから新しいパスワードを設定してください（<strong>30分間有効</strong>）。</p>` +
    `<p style="margin:24px 0"><a href="${resetUrl}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">パスワードを再設定する</a></p>` +
    `<p style="font-size:13px;color:#666">ボタンが押せない場合は次のURLを開いてください:<br><a href="${resetUrl}">${resetUrl}</a></p>` +
    `<hr style="border:none;border-top:1px solid #eee;margin:20px 0">` +
    `<p style="font-size:13px;color:#666">このメールに心当たりがない場合は、何もせず破棄してください。パスワードは変更されません。</p>` +
    `</div>`;
  return { subject, html, text };
}
