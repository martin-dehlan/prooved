import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { lookupProfile, PublicProfile } from '@/features/profile';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await lookupProfile(slug);
  if (result.kind === 'not_found') return { title: 'Profil nicht gefunden — Prooved' };
  if (result.kind === 'suspended') return { title: 'Profil gesperrt — Prooved' };
  const name = result.data.user.name ?? slug;
  return {
    title: `${name} — Prooved`,
    description: `Verifizierte Marketplace-Reputation von ${name}`,
    openGraph: {
      title: `${name} auf Prooved`,
      description: `${result.data.connections.length} verifizierte Plattformen`,
      type: 'profile',
      url: `/${slug}`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const result = await lookupProfile(slug);
  if (result.kind === 'not_found') notFound();
  if (result.kind === 'suspended') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-5 py-10">
        <div className="max-w-md rounded-2xl border border-danger/30 bg-surface p-8 text-center">
          <p className="text-3xl">🚫</p>
          <h1 className="mt-3 text-xl font-bold text-text">Profil gesperrt</h1>
          <p className="mt-2 text-sm text-muted">
            Dieses Profil wurde wegen Verstoß gegen unsere Richtlinien gesperrt.
          </p>
          <p className="mt-4 text-xs text-muted">@{result.slug} · Prooved</p>
        </div>
      </div>
    );
  }
  return <PublicProfile data={result.data} />;
}
