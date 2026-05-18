import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ConnectionList } from '@/features/connections';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Dashboard' });
  return { title: t('metaTitle') };
}

export default function DashboardPage() {
  return <ConnectionList />;
}
