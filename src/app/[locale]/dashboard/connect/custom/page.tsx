import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CustomVerifyFlow } from '@/features/connections/components/CustomVerifyFlow';

export default async function ConnectCustomPage() {
  const t = await getTranslations('ConnectPlatform');
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/connect"
        className="text-sm font-medium text-muted hover:text-text"
      >
        {t('back')}
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">{t('custom.title')}</h1>
        <p className="text-sm text-muted">{t('custom.subline')}</p>
      </div>
      <CustomVerifyFlow />
    </div>
  );
}
