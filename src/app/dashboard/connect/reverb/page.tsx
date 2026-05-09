import Link from 'next/link';
import { ReverbTokenFlow } from '@/features/connections/components/ReverbTokenFlow';

export default function ConnectReverbPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/connect"
        className="text-sm font-medium text-muted hover:text-text"
      >
        ← Zurück
      </Link>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-text">
          Reverb verknüpfen
        </h1>
        <p className="text-sm text-muted">
          Silver-Tier · Personal Access Token. Reverb hat keine offene
          OAuth-App-Registrierung, deshalb nutzen wir einen privaten Token.
        </p>
      </div>
      <ReverbTokenFlow />
    </div>
  );
}
