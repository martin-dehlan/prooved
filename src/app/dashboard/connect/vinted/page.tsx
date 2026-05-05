import { BioCodeFlow } from '@/features/connections';

export default function ConnectVintedPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Vinted verknüpfen</h1>
      <p className="text-sm text-zinc-600">
        Tier: Silver. Bio-Code: gültig für 30 Tage, dann Re-Verifizierung nötig.
      </p>
      <BioCodeFlow platform="vinted" />
    </div>
  );
}
