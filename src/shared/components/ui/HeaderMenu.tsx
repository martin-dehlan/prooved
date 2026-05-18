import { Settings } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createSupabaseServer } from '@/shared/lib/supabase/server';
import { GuestMenu } from './GuestMenu';

export async function HeaderMenu() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations('Header');

  if (user) {
    return (
      <Link
        href="/dashboard/settings"
        aria-label={t('settings')}
        title={t('settings')}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text transition hover:bg-elevated"
      >
        <Settings size={18} aria-hidden />
      </Link>
    );
  }

  return <GuestMenu />;
}
