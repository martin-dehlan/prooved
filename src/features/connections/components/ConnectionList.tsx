'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui';
import { PlatformCard } from './PlatformCard';
import { useAuth } from '@/features/auth';
import { useConnections, useRefreshConnection, useDeleteConnection } from '@/features/connections/hooks/useConnections';

export function ConnectionList() {
  const { authUserId, appUser, loading } = useAuth();
  const { data, isLoading } = useConnections(authUserId);
  const refresh = useRefreshConnection(authUserId);
  const remove = useDeleteConnection(authUserId);

  if (loading || isLoading) {
    return <p className="text-sm text-zinc-500">Lade Verbindungen…</p>;
  }
  if (!appUser) {
    return <p className="text-sm text-zinc-500">Kein Profil gefunden.</p>;
  }

  const connections = data ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Deine Plattformen</h2>
        <Link href="/dashboard/connect">
          <Button size="sm">Plattform verknüpfen</Button>
        </Link>
      </div>
      {connections.length === 0 ? (
        <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          Noch keine Plattformen verknüpft.{' '}
          <Link href="/dashboard/connect" className="font-medium text-zinc-900 underline">
            Jetzt starten
          </Link>
          .
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {connections.map((c) => (
            <li key={c.id} className="space-y-2">
              <PlatformCard connection={c} />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refresh.mutate(c.id)}
                  disabled={refresh.isPending}
                >
                  Aktualisieren
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`${c.platform}-Verknüpfung trennen?`)) remove.mutate(c.id);
                  }}
                >
                  Trennen
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-md bg-zinc-50 p-4 text-sm text-zinc-700">
        <p className="font-medium">Dein öffentliches Profil:</p>
        <Link
          href={`/${appUser.slug}`}
          className="font-mono text-zinc-900 underline"
        >
          prooved.de/{appUser.slug}
        </Link>
      </div>
    </div>
  );
}
