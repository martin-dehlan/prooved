import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createSupabaseServer } from '@/shared/lib/supabase/server';
import { ThemeSetting } from './ThemeSetting';
import { SignOutButton } from './SignOutButton';
import { DeleteAccountButton } from './DeleteAccountButton';

export const metadata = { title: 'Einstellungen — Prooved' };

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/register?redirect=/dashboard/settings');

  const { data: appUser } = await supabase
    .from('users')
    .select('email, slug, created_at')
    .eq('id', user.id)
    .maybeSingle();
  if (!appUser) redirect('/register?redirect=/dashboard/settings');

  const memberSince = new Date(appUser.created_at).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-text"
      >
        <ChevronLeft size={16} aria-hidden />
        Zurück
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-text">Einstellungen</h1>

      <Section title="Account">
        <Row label="E-Mail" value={appUser.email} />
        <Row
          label="Profil-URL"
          value={
            <Link
              href={`/${appUser.slug}`}
              className="text-accent hover:underline"
            >
              prooved.xyz/{appUser.slug}
            </Link>
          }
        />
        <Row label="Mitglied seit" value={memberSince} />
      </Section>

      <Section title="Darstellung">
        <ThemeSetting />
      </Section>

      <SignOutButton />

      <Section title="Account löschen" tone="danger">
        <p className="text-sm text-muted">
          Entfernt deinen Account, alle Plattform-Verbindungen und gemeldeten
          Profile. Nicht umkehrbar.
        </p>
        <div className="mt-3">
          <DeleteAccountButton />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  tone = 'default',
  children,
}: {
  title: string;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border bg-surface p-5 ${
        tone === 'danger' ? 'border-danger/40' : 'border-elevated'
      }`}
    >
      <h2
        className={`text-base font-semibold ${
          tone === 'danger' ? 'text-danger' : 'text-text'
        }`}
      >
        {title}
      </h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-elevated/50 py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-text text-right">{value}</span>
    </div>
  );
}
