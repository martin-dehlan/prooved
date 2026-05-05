import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicProfile, PublicProfile } from '@/features/profile';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicProfile(slug);
  if (!data) return { title: 'Profil nicht gefunden — Prooved' };
  const name = data.user.name ?? slug;
  return {
    title: `${name} — Prooved`,
    description: `Verifizierte Marketplace-Reputation von ${name}`,
    openGraph: {
      title: `${name} auf Prooved`,
      description: `${data.connections.length} verifizierte Plattformen`,
      type: 'profile',
      url: `/${slug}`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicProfile(slug);
  if (!data) notFound();
  return <PublicProfile data={data} />;
}
