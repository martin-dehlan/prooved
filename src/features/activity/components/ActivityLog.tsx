'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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

export function ActivityLog() {
  const t = useTranslations('ActivityLog');
  const locale = useLocale();
  const [events, setEvents] = useState<Event[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/activity')
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d) => setEvents(d.events))
      .catch(() => setEvents([]));
  }, []);

  function formatRelative(iso: string): string {
    const d = new Date(iso).getTime();
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return t('justNow');
    if (diff < 3600) return t('minAgo', { n: Math.floor(diff / 60) });
    if (diff < 86400) return t('hAgo', { n: Math.floor(diff / 3600) });
    if (diff < 7 * 86400) return t('daysAgo', { n: Math.floor(diff / 86400) });
    return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE');
  }

  if (!events || events.length === 0) return null;

  const visible = open ? events : events.slice(0, 5);

  return (
    <section className="space-y-2">
      <header className="flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {t('title')}
        </h2>
        <span className="text-xs text-muted tabular-nums">{events.length}</span>
      </header>
      <ul className="space-y-1.5">
        {visible.map((e) => {
          const platform = e.platform
            ? PLATFORM_LABELS[e.platform as keyof typeof PLATFORM_LABELS] ?? e.platform
            : null;
          const isWarn = e.kind === 'rating_drop_detected';
          const kindKey = `kind.${e.kind}` as const;
          return (
            <li
              key={e.id}
              className="flex items-baseline justify-between gap-3 text-xs"
            >
              <span className="min-w-0 flex-1 truncate">
                {platform && (
                  <span className={isWarn ? 'font-medium text-warning' : 'font-medium text-text'}>
                    {platform}{' '}
                  </span>
                )}
                <span className={isWarn ? 'text-warning' : 'text-muted'}>
                  {t.has(kindKey) ? t(kindKey) : e.kind}
                </span>
              </span>
              <span className="shrink-0 text-muted tabular-nums">
                {formatRelative(e.created_at)}
              </span>
            </li>
          );
        })}
      </ul>
      {events.length > 5 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] text-muted underline-offset-2 hover:text-text hover:underline"
        >
          {open ? t('less') : t('showAll', { n: events.length })}
        </button>
      )}
    </section>
  );
}
