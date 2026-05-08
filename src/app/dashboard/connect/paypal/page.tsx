import Link from 'next/link';
import { OAuthConnectButton } from '@/features/connections';

export default function ConnectPayPalPage() {
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
          PayPal verknüpfen
        </h1>
        <p className="text-sm text-muted">
          Gold-Tier · OAuth. Wir holen nur Identitätsstatus, keine Transaktionsdaten.
        </p>
      </div>
      <OAuthConnectButton platform="paypal" />
    </div>
  );
}
