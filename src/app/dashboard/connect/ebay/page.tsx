import Link from 'next/link';
import { OAuthConnectButton } from '@/features/connections';

export default function ConnectEbayPage() {
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
          eBay verknüpfen
        </h1>
        <p className="text-sm text-muted">
          Gold-Tier · OAuth. Du wirst zu eBay weitergeleitet, wir holen FeedbackScore über
          die Trading API.
        </p>
      </div>
      <OAuthConnectButton platform="ebay" />
    </div>
  );
}
