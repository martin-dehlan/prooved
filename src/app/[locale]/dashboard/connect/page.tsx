import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PlatformGrid } from '@/features/connections';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ConnectPage' });
  return { title: t('metaTitle') };
}

export default async function ConnectIndexPage() {
  const t = await getTranslations('ConnectPage');
  const tCommon = await getTranslations('Common');
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted hover:text-text"
      >
        {tCommon('back')}
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">{t('h1')}</h1>
        <p className="text-sm text-muted">{t('subline')}</p>
      </div>
      <PlatformGrid />
    </div>
  );
}
