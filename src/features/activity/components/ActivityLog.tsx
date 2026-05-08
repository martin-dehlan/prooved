'use client';

import { useEffect, useState } from 'react';
import { PLATFORM_LABELS } from '@/shared/types/platform.types';

type Kind =
  | 'connection_added'
  | 'connection_removed'
  | 'connection_refreshed'
  | 'connection_hidden'
  | 'connection_shown'
  | 'connection_paused'
  | 'connection_resumed'
  | 'connection_field_toggled'
  | 'rating_drop_detected'
  | 'login'
  | 'profile_updated'
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'export_generated';

interface Event {
  id: string;
  kind: Kind;
  platform: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const KIND_LABEL: Record<Kind, string> = {
  connection_added: 'verknüpft',
  connection_removed: 'getrennt',
  connection_refreshed: 'aktualisiert',
  connection_hidden: 'versteckt',
  connection_shown: 'wieder sichtbar',
  connection_paused: 'pausiert',
  connection_resumed: 'fortgesetzt',
  connection_field_toggled: 'Anzeige geändert',
  rating_drop_detected: '⚠ Bewertung gefallen',
  login: 'eingeloggt',
  profile_updated: 'Profil aktualisiert',
  wallet_connected: 'Wallet verbunden',
  wallet_disconnected: 'Wallet getrennt',
  export_generated: 'Export erstellt',
};

const KIND_ICON: Record<Kind, string> = {
  connection_added: '+',
  connection_removed: '−',
  connection_refreshed: '↻',
  connection_hidden: '🙈',
  connection_shown: '👁',
  connection_paused: '⏸',
  connection_resumed: '▶',
  connection_field_toggled: '⚙',
  rating_drop_detected: '⚠',
  login: '→',
  profile_updated: '✎',
  wallet_connected: '◎',
  wallet_disconnected: '◌',
  export_generated: '⬇',
};

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return 'gerade eben';
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} h`;
  if (diff < 7 * 86400) return `vor ${Math.floor(diff / 86400)} Tagen`;
  return new Date(iso).toLocaleDateString('de-DE');
}

export function ActivityLog() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/activity')
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d) => setEvents(d.events))
      .catch(() => setEvents([]));
  }, []);

  if (!events) {
    return (
      <p className="text-sm text-muted">Lade Aktivität…</p>
    );
  }
  if (events.length === 0) {
    return null;
  }

  const visible = open ? events : events.slice(0, 5);

  return (
    <section className="space-y-2 rounded-2xl border border-elevated bg-surface p-5">
      <header className="flex items-baseline justify-between">
        <h2 className="text-base font-bold text-text">Letzte Aktivität</h2>
        <span className="text-xs text-muted">{events.length}</span>
      </header>
      <ul className="space-y-2">
        {visible.map((e) => {
          const platform = e.platform
            ? PLATFORM_LABELS[e.platform as keyof typeof PLATFORM_LABELS] ?? e.platform
            : null;
          return (
            <li key={e.id} className="flex items-start gap-3 text-sm">
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs"
              >
                {KIND_ICON[e.kind] ?? '·'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-text">
                  {platform && <span className="font-medium">{platform}</span>}
                  {platform ? ' ' : ''}
                  {KIND_LABEL[e.kind] ?? e.kind}
                </p>
                <p className="text-xs text-muted">{formatRelative(e.created_at)}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {events.length > 5 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-medium text-muted underline-offset-2 hover:text-text hover:underline"
        >
          {open ? 'weniger anzeigen' : `alle ${events.length} anzeigen`}
        </button>
      )}
    </section>
  );
}
