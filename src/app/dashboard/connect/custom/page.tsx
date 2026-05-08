import Link from 'next/link';
import { CustomVerifyFlow } from '@/features/connections/components/CustomVerifyFlow';

export default function ConnectCustomPage() {
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
          Andere Plattform verknüpfen
        </h1>
        <p className="text-sm text-muted">
          Silver-Tier · Bio-Code auf beliebiger Seite. Beweist Eigentum,
          ohne Bewertungs-Daten zu lesen.
        </p>
      </div>
      <CustomVerifyFlow />
    </div>
  );
}
