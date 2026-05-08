import Link from 'next/link';
import { OAuthConnectButton } from '@/features/connections';

export default function ConnectEtsyPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/connect"
        className="text-sm font-medium text-muted hover:text-text"
      >
        ← Zurück
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Etsy verknüpfen
        </h1>
        <p className="text-sm text-muted">
          Gold-Tier · OAuth. Wir holen Bewertungs-Schnitt + Anzahl deines Shops
          via Etsy API v3.
        </p>
      </div>
      <OAuthConnectButton platform="etsy" />
    </div>
  );
}
