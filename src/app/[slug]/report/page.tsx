import { notFound } from 'next/navigation';
import { ReportForm } from '@/features/report';
import { getPublicProfile } from '@/features/profile';

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: 'Profil melden — Prooved' };

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicProfile(slug);
  if (!data) notFound();
  return (
    <main className="mx-auto max-w-md space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">
        Profil &quot;{data.user.name ?? slug}&quot; melden
      </h1>
      <p className="text-sm text-muted">
        Wir prüfen jede Meldung manuell. Spam-Schutz: max. 3 Meldungen pro IP / Tag.
      </p>
      <ReportForm targetSlug={slug} />
    </main>
  );
}
