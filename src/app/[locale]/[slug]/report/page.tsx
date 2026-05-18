import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ReportForm } from '@/features/report';
import { getPublicProfile } from '@/features/profile';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ReportPage' });
  return { title: t('metaTitle') };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicProfile(slug);
  if (!data) notFound();
  const t = await getTranslations('ReportPage');
  return (
    <main className="mx-auto max-w-md space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">
        {t('h1', { name: data.user.name ?? slug })}
      </h1>
      <p className="text-sm text-muted">{t('subline')}</p>
      <ReportForm targetSlug={slug} />
    </main>
  );
}
