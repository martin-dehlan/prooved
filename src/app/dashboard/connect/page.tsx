import { PlatformGrid } from '@/features/connections';

export const metadata = { title: 'Plattformen verknüpfen — Prooved' };

export default function ConnectIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Plattform verknüpfen</h1>
      <p className="text-sm text-zinc-600">
        Wähle eine Plattform um sie mit deinem Prooved-Profil zu verbinden.
      </p>
      <PlatformGrid />
    </div>
  );
}
