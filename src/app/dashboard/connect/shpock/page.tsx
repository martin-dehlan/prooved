import Link from 'next/link';
import { BioCodeFlow } from '@/features/connections';

export default function ConnectShpockPage() {
  return (
    <div className="space-y-6">
      <Link href="/dashboard/connect" className="text-sm font-medium text-muted hover:text-text">
        ← Zurück
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">Shpock verknüpfen</h1>
        <p className="text-sm text-muted">
          Silver-Tier · Bio-Code in About-Section.
        </p>
      </div>
      <BioCodeFlow platform="shpock" />
    </div>
  );
}
