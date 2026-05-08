import Link from 'next/link';
import { DomainVerifyFlow } from '@/features/connections/components/DomainVerifyFlow';

export default function ConnectWebsitePage() {
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
          Eigene Website verknüpfen
        </h1>
        <p className="text-sm text-muted">
          Silver-Tier · DNS-TXT-Record. Beweist dass dir die Domain gehört.
        </p>
      </div>
      <DomainVerifyFlow />
    </div>
  );
}
