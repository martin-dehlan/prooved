// Lightweight Resend wrapper. No-op if RESEND_API_KEY missing → safe in dev.

const RESEND_API = 'https://api.resend.com/emails';

interface SendArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(args: SendArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // Silent no-op when not configured
  const from = process.env.PROOVED_FROM_EMAIL ?? 'Prooved <noreply@prooved.de>';
  try {
    await fetch(RESEND_API, {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        text: args.text,
        html: args.html,
      }),
    });
  } catch (e) {
    console.error('[email] sendEmail failed', e);
    // Never throw — email is fire-and-forget
  }
}

import { createSupabaseAdmin } from '@/shared/lib/supabase/server';

/** Look up user email + send connection-added notice. Fire-and-forget. */
export async function notifyUserOfNewConnection(args: {
  userId: string;
  platform: string;
}): Promise<void> {
  try {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from('users')
      .select('email')
      .eq('id', args.userId)
      .maybeSingle();
    if (!data?.email) return;
    await notifyConnectionAdded({
      email: data.email,
      platform: args.platform,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://prooved-peach.vercel.app',
    });
  } catch (e) {
    console.error('[email] notifyUserOfNewConnection failed', e);
  }
}

export async function notifyConnectionAdded(args: {
  email: string;
  platform: string;
  appUrl: string;
}): Promise<void> {
  const platform = args.platform[0]!.toUpperCase() + args.platform.slice(1);
  const dashboardUrl = `${args.appUrl}/dashboard`;
  await sendEmail({
    to: args.email,
    subject: `${platform} mit deinem Prooved-Account verknüpft`,
    text: [
      `Hallo,`,
      ``,
      `Eine neue Plattform-Verknüpfung wurde gerade zu deinem Prooved-Profil hinzugefügt:`,
      ``,
      `  ${platform}`,
      ``,
      `War das Du? Dann ist alles gut. Falls nicht, log dich ein und trenne die Verbindung sofort:`,
      `  ${dashboardUrl}`,
      ``,
      `— Prooved`,
    ].join('\n'),
  });
}
