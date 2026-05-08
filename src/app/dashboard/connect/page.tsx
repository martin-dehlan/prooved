import Link from 'next/link';
import { PlatformGrid } from '@/features/connections';

export const metadata = { title: 'Plattformen verknüpfen — Prooved' };

export default function ConnectIndexPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted hover:text-text"
      >
        ← Zurück
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Plattform verknüpfen
        </h1>
        <p className="text-sm text-muted">
          Wähle eine Plattform aus.
        </p>
      </div>
      <PlatformGrid />
    </div>
  );
}
