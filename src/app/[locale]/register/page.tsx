import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { HeaderMenu } from '@/shared/components/ui/HeaderMenu';
import { Logo } from '@/shared/components/ui/Logo';
import { RegisterFlow } from './RegisterFlow';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RegisterPage' });
  return { title: t('metaTitle') };
}

export default async function RegisterPage() {
  const tCommon = await getTranslations('Common');
  return (
    <main className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 py-6">
        <Link href="/" aria-label={tCommon('home')}>
          <Logo size={28} />
        </Link>
        <HeaderMenu />
      </header>
      <div className="mx-auto max-w-md px-5 pb-10">
        <Suspense fallback={<p className="text-base text-muted">{tCommon('loading')}</p>}>
          <RegisterFlow />
        </Suspense>
      </div>
    </main>
  );
}
