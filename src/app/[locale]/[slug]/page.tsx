import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { lookupProfile, PublicProfile } from '@/features/profile';
import { createSupabaseServer } from '@/shared/lib/supabase/server';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const result = await lookupProfile(slug);
  if (result.kind === 'not_found') return { title: t('metaNotFound') };
  if (result.kind === 'suspended') return { title: t('metaSuspended') };
  const name = result.data.user.name ?? slug;
  return {
    title: t('metaTitleSuffix', { name }),
    description: t('metaDescription', { name }),
    openGraph: {
      title: t('ogTitle', { name }),
      description: t('ogDescription', { count: result.data.connections.length }),
      type: 'profile',
      url: `/${locale}/${slug}`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const result = await lookupProfile(slug);
  if (result.kind === 'not_found') notFound();
  if (result.kind === 'suspended') {
    const t = await getTranslations('ProfilePage');
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-5 py-10">
        <div className="max-w-md rounded-2xl border border-danger/30 bg-surface p-8 text-center">
          <p className="text-3xl">🚫</p>
          <h1 className="mt-3 text-xl font-bold text-text">{t('suspendedTitle')}</h1>
          <p className="mt-2 text-sm text-muted">{t('suspendedText')}</p>
          <p className="mt-4 text-xs text-muted">@{result.slug} · Prooved</p>
        </div>
      </div>
    );
  }
  const supabase = await createSupabaseServer();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isOwner = !!authUser && authUser.id === result.data.user.id;

  return <PublicProfile data={result.data} isOwner={isOwner} />;
}
