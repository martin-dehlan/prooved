import { BioCodeFlow } from '@/features/connections';

export default function ConnectKleinanzeigenPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Kleinanzeigen verknüpfen</h1>
      <p className="text-sm text-zinc-600">
        Tier: Silver. Hinweis: Kleinanzeigen hat keine offizielle API. Wir parsen
        die öffentliche Profilseite — bei Layout-Änderungen kann der Status
        kurzzeitig auf &quot;nicht verfügbar&quot; springen.
      </p>
      <BioCodeFlow platform="kleinanzeigen" />
    </div>
  );
}
