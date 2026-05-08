import Link from 'next/link';
import { BioCodeFlow } from '@/features/connections';

export default function ConnectDiscogsPage() {
  return (
    <div className="space-y-6">
      <Link href="/dashboard/connect" className="text-sm font-medium text-muted hover:text-text">
        ← Zurück
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">Discogs verknüpfen</h1>
        <p className="text-sm text-muted">
          Silver-Tier · Bio-Code in Profil-Beschreibung. 30 Tage gültig.
        </p>
      </div>
      <BioCodeFlow platform="discogs" />
    </div>
  );
}
