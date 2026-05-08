import Link from 'next/link';
import { OAuthConnectButton } from '@/features/connections';

export default function ConnectGitHubPage() {
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
          GitHub verknüpfen
        </h1>
        <p className="text-sm text-muted">
          Silver-Tier · OAuth. Beweist Account-Alter, Aktivität und (falls
          gesetzt) verifizierten Klarnamen.
        </p>
      </div>
      <OAuthConnectButton platform="github" />
    </div>
  );
}
