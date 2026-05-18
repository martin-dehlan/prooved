import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BioCodeFlow } from '@/features/connections';

export default async function ConnectShpockPage() {
  const t = await getTranslations('ConnectPlatform');
  return (
    <div className="space-y-6">
      <Link href="/dashboard/connect" className="text-sm font-medium text-muted hover:text-text">
        {t('back')}
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">{t('shpock.title')}</h1>
        <p className="text-sm text-muted">{t('shpock.subline')}</p>
      </div>
      <BioCodeFlow platform="shpock" />
    </div>
  );
}
