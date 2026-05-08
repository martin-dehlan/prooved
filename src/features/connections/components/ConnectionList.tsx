'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/shared/components/ui';
import { TrustScoreCard } from './TrustScoreCard';
import { ActivityLog } from '@/features/activity/components/ActivityLog';
import { useAuth } from '@/features/auth';
import {
  useConnections,
  useRefreshConnection,
  useDeleteConnection,
  useSetVisibility,
} from '@/features/connections/hooks/useConnections';
import { PLATFORM_LABELS, PLATFORM_TIER } from '@/shared/types/platform.types';
import { deriveStatus, type Connection } from '@/features/connections/types/connection.types';

export function ConnectionList() {
  const { authUserId, appUser, loading } = useAuth();
  const { data, isLoading } = useConnections(authUserId);
  const refresh = useRefreshConnection(authUserId);
  const remove = useDeleteConnection(authUserId);
  const visibility = useSetVisibility(authUserId);
  const [openId, setOpenId] = useState<string | null>(null);

  if (loading || isLoading) {
    return <p className="text-base text-muted">Lade…</p>;
  }
  if (!appUser) {
    return <p className="text-base text-muted">Kein Profil gefunden.</p>;
  }

  const connections = data ?? [];
  const profileHost =
    typeof window !== 'undefined' ? window.location.host : 'prooved.de';

  return (
    <div className="space-y-8">
      <section className="text-center">
        <p className="text-sm font-medium text-muted">Dein Profil</p>
        <Link
          href={`/${appUser.slug}`}
          className="mt-1 inline-block break-all text-xl font-bold text-text hover:underline"
        >
          {profileHost}/{appUser.slug}
        </Link>
      </section>

      {connections.length > 0 && <TrustScoreCard connections={connections} />}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-text">Plattformen</h2>
          <span className="text-sm text-muted">{connections.length} aktiv</span>
        </div>

        {connections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-elevated bg-surface p-8 text-center">
            <p className="text-base text-text">Noch keine Plattform verknüpft.</p>
            <p className="mt-1 text-sm text-muted">
              Verknüpfe eBay, PayPal, Vinted oder Kleinanzeigen.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {connections.map((c) => {
              const showError = refresh.isError && refresh.variables === c.id;
              const errMsg = showError
                ? refresh.error instanceof Error
                  ? refresh.error.message
                  : 'Unbekannter Fehler'
                : null;
              return (
                <li key={c.id}>
                  <ConnectionRow
                    connection={c}
                    expanded={openId === c.id}
                    onToggle={() => setOpenId(openId === c.id ? null : c.id)}
                    onRefresh={() => refresh.mutate(c.id)}
                    onDelete={() => {
                      if (confirm(`${PLATFORM_LABELS[c.platform]} trennen?`))
                        remove.mutate(c.id);
                    }}
                    onToggleVisibility={() =>
                      visibility.mutate({ id: c.id, hidden: !c.hidden })
                    }
                    onTogglePause={() =>
                      visibility.mutate({ id: c.id, paused: !c.paused })
                    }
                    onToggleName={() =>
                      visibility.mutate({ id: c.id, show_name: !c.show_name })
                    }
                    onTogglePicture={() =>
                      visibility.mutate({ id: c.id, show_picture: !c.show_picture })
                    }
                    busy={refresh.isPending || remove.isPending || visibility.isPending}
                    errorMessage={openId === c.id ? errMsg : null}
                  />
                </li>
              );
            })}
          </ul>
        )}

        <Link href="/dashboard/connect" className="block">
          <Button variant="primary" size="lg" block>
            + Plattform hinzufügen
          </Button>
        </Link>
      </section>

      <ActivityLog />

      <section className="flex justify-center gap-6 text-sm text-muted">
        <Link href="/dashboard/privacy" className="hover:text-text hover:underline">
          Datenschutz
        </Link>
      </section>
    </div>
  );
}

function FieldToggle({
  label,
  enabled,
  onToggle,
  disabled,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="flex w-full items-center justify-between text-left text-sm disabled:opacity-50"
    >
      <span className="text-text">{label}</span>
      <span
        aria-pressed={enabled}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          enabled ? 'bg-accent' : 'bg-elevated'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-surface transition ${
            enabled ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}

const PLATFORM_GLYPH: Record<string, string> = {
  ebay: 'eB', paypal: 'PP', vinted: 'Vt', kleinanzeigen: 'KA',
  website: '◉', etsy: 'Et', github: 'Gh', linkedin: 'in',
  discogs: 'Dc', willhaben: 'Wh', shpock: 'Sh', custom: '+',
};
const PLATFORM_BG: Record<string, string> = {
  ebay: 'bg-blue-600',
  paypal: 'bg-sky-700',
  vinted: 'bg-teal-600',
  kleinanzeigen: 'bg-warning',
  website: 'bg-text',
  etsy: 'bg-orange-700',
  github: 'bg-zinc-800',
  linkedin: 'bg-sky-600',
  discogs: 'bg-zinc-700',
  willhaben: 'bg-accent',
  shpock: 'bg-yellow-500',
  custom: 'bg-elevated',
};
const STATUS: Record<ReturnType<typeof deriveStatus>, { label: string; cls: string }> = {
  verified: { label: 'Verifiziert', cls: 'text-accent' },
  expiring: { label: 'Läuft bald ab', cls: 'text-warning' },
  expired: { label: 'Abgelaufen', cls: 'text-danger' },
  pending: { label: 'Ausstehend', cls: 'text-muted' },
  temporarily_unavailable: { label: 'Nicht verfügbar', cls: 'text-warning' },
};

function ConnectionRow({
  connection: c,
  expanded,
  onToggle,
  onRefresh,
  onDelete,
  onToggleVisibility,
  onTogglePause,
  onToggleName,
  onTogglePicture,
  busy,
  errorMessage,
}: {
  connection: Connection;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onTogglePause: () => void;
  onToggleName: () => void;
  onTogglePicture: () => void;
  busy: boolean;
  errorMessage: string | null;
}) {
  const tier = PLATFORM_TIER[c.platform];
  const status = STATUS[deriveStatus(c)];

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-surface ${c.hidden ? 'border-elevated opacity-70' : 'border-elevated'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-bg"
      >
        <div
          aria-hidden
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${PLATFORM_BG[c.platform]}`}
        >
          {PLATFORM_GLYPH[c.platform]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">
              {PLATFORM_LABELS[c.platform]}
            </span>
            <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text">
              {tier}
            </span>
          </div>
          <p className={`mt-0.5 text-sm ${status.cls}`}>{status.label}</p>
        </div>
        <span
          aria-hidden
          className={`text-muted transition ${expanded ? 'rotate-180' : ''}`}
        >
          ⌄
        </span>
      </button>

      {expanded && (
        <div className="border-t border-elevated bg-bg p-4">
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            {c.rating_score != null && (
              <>
                <dt className="text-muted">Bewertung</dt>
                <dd className="font-medium text-text">
                  ★ {c.rating_score.toFixed(1)}
                  {c.rating_count != null && ` · ${c.rating_count}`}
                </dd>
              </>
            )}
            {c.verified_at && (
              <>
                <dt className="text-muted">Verifiziert</dt>
                <dd className="text-text">
                  {new Date(c.verified_at).toLocaleDateString('de-DE')}
                </dd>
              </>
            )}
            {c.expires_at && (
              <>
                <dt className="text-muted">Läuft ab</dt>
                <dd className="text-text">
                  {new Date(c.expires_at).toLocaleDateString('de-DE')}
                </dd>
              </>
            )}
          </dl>
          {(c.verified_name || c.verified_picture_url) && !c.hidden && (
            <div className="mt-4 space-y-2 rounded-xl bg-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Auf deinem Profil zeigen
              </p>
              {c.verified_name && (
                <FieldToggle
                  label={`Name "${c.verified_name}"`}
                  enabled={c.show_name}
                  onToggle={onToggleName}
                  disabled={busy}
                />
              )}
              {c.verified_picture_url && (
                <FieldToggle
                  label="Profilbild"
                  enabled={c.show_picture}
                  onToggle={onTogglePicture}
                  disabled={busy}
                />
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={busy || c.paused}
              title={c.paused ? 'Pausiert — wird nicht aktualisiert' : undefined}
            >
              {busy ? 'Lade…' : 'Aktualisieren'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onTogglePause}
              disabled={busy}
            >
              {c.paused ? '▶ Fortsetzen' : '⏸ Pausieren'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleVisibility}
              disabled={busy}
            >
              {c.hidden ? '👁 Anzeigen' : '🙈 Verstecken'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} disabled={busy}>
              Trennen
            </Button>
          </div>
          {c.paused && (
            <p className="mt-3 text-xs text-muted">
              Pausiert — Daten bleiben eingefroren (kein Auto-Refresh).
            </p>
          )}
          {c.hidden && (
            <p className="mt-3 text-xs text-muted">
              Versteckt — auf deinem öffentlichen Profil unsichtbar.
            </p>
          )}
          {c.last_error && (
            <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
              Letzter Refresh-Fehler: {c.last_error}
            </p>
          )}
          {errorMessage && (
            <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              Fehler: {errorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
