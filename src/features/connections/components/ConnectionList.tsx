'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Input } from '@/shared/components/ui';
import { PlatformIcon } from '@/shared/components/ui/PlatformIcon';
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
  const [query, setQuery] = useState('');

  if (loading || isLoading) {
    return <p className="text-sm text-muted">Lade…</p>;
  }
  if (!appUser) {
    return <p className="text-sm text-muted">Kein Profil gefunden.</p>;
  }

  const allConnections = data ?? [];
  const q = query.trim().toLowerCase();
  const connections = q
    ? allConnections.filter((c) => {
        const label = (
          (c.platform === 'custom' && c.custom_label) ||
          PLATFORM_LABELS[c.platform] ||
          c.platform
        ).toLowerCase();
        return (
          label.includes(q) ||
          c.platform.toLowerCase().includes(q) ||
          (c.platform_user_id ?? '').toLowerCase().includes(q) ||
          (c.verified_name ?? '').toLowerCase().includes(q)
        );
      })
    : allConnections;
  const profileHost =
    typeof window !== 'undefined' ? window.location.host : 'prooved.xyz';

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Dein Profil
        </p>
        <Link
          href={`/${appUser.slug}`}
          className="mt-1 inline-block break-all text-base font-medium text-text underline-offset-4 hover:text-accent hover:underline"
        >
          {profileHost}/{appUser.slug}
        </Link>
      </section>

      {allConnections.length > 0 && <TrustScoreCard connections={allConnections} />}

      <section className="space-y-3">
        <header className="flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Plattformen
          </h2>
          <span className="text-xs text-muted tabular-nums">
            {q
              ? `${connections.length} / ${allConnections.length}`
              : `${allConnections.length} aktiv`}
          </span>
        </header>

        {allConnections.length >= 4 && (
          <Input
            type="search"
            placeholder="Suche…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 text-sm"
          />
        )}

        {allConnections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-elevated bg-surface p-6 text-center">
            <p className="text-sm text-text">Noch keine Plattform verknüpft.</p>
            <p className="mt-1 text-xs text-muted">
              Verknüpfe eBay, PayPal, Vinted oder eine andere Plattform.
            </p>
          </div>
        ) : connections.length === 0 ? (
          <p className="rounded-lg border border-dashed border-elevated bg-surface p-6 text-center text-sm text-muted">
            Keine Treffer für „{query}"
          </p>
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
          <Button variant="primary" size="md" block>
            Plattform hinzufügen
          </Button>
        </Link>
      </section>

      <ActivityLog />

      <nav className="flex justify-center gap-3 text-xs text-muted">
        <Link href="/how-it-works" className="hover:text-text hover:underline">
          Wie funktioniert das?
        </Link>
        <span aria-hidden>·</span>
        <Link href="/dashboard/privacy" className="hover:text-text hover:underline">
          Datenschutz
        </Link>
      </nav>
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
      className="flex w-full items-center justify-between text-left text-xs disabled:opacity-50"
    >
      <span className="text-text">{label}</span>
      <span
        aria-pressed={enabled}
        className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition ${
          enabled ? 'bg-accent' : 'bg-elevated'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 rounded-full bg-surface transition ${
            enabled ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}

const PLATFORM_TILE: Record<string, { bg: string; fg: string }> = {
  ebay:          { bg: 'bg-blue-600',   fg: 'text-white' },
  paypal:        { bg: 'bg-sky-700',    fg: 'text-white' },
  vinted:        { bg: 'bg-teal-600',   fg: 'text-white' },
  kleinanzeigen: { bg: 'bg-[#1D4B00]',  fg: 'text-white' },
  etsy:          { bg: 'bg-orange-700', fg: 'text-white' },
  github:        { bg: 'bg-zinc-800',   fg: 'text-white' },
  linkedin:      { bg: 'bg-sky-600',    fg: 'text-white' },
  discogs:       { bg: 'bg-zinc-700',   fg: 'text-white' },
  willhaben:     { bg: 'bg-accent',     fg: 'text-white' },
  shpock:        { bg: 'bg-yellow-500', fg: 'text-text' },
  website:       { bg: 'bg-elevated',   fg: 'text-text' },
  custom:        { bg: 'bg-elevated',   fg: 'text-text' },
};

const STATUS: Record<ReturnType<typeof deriveStatus>, { label: string; cls: string }> = {
  verified: { label: 'verifiziert', cls: 'text-accent' },
  expiring: { label: 'läuft bald ab', cls: 'text-warning' },
  expired: { label: 'abgelaufen', cls: 'text-danger' },
  pending: { label: 'ausstehend', cls: 'text-muted' },
  temporarily_unavailable: { label: 'nicht verfügbar', cls: 'text-warning' },
};

const TIER_DOT: Record<string, string> = {
  gold: 'bg-warning',
  silver: 'bg-muted/40',
  bronze: 'bg-warning/40',
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
  const tile = PLATFORM_TILE[c.platform] ?? { bg: 'bg-elevated', fg: 'text-text' };
  const label =
    c.platform === 'custom' && c.custom_label
      ? c.custom_label
      : PLATFORM_LABELS[c.platform];
  const stateChips: string[] = [];
  if (c.hidden) stateChips.push('versteckt');
  if (c.paused) stateChips.push('pausiert');

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-surface transition ${
        c.hidden ? 'border-elevated opacity-60' : 'border-elevated'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-bg"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tile.bg} ${tile.fg}`}
        >
          <PlatformIcon platform={c.platform} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-text">{label}</span>
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${TIER_DOT[tier] ?? 'bg-muted/40'}`}
              title={tier}
            />
          </div>
          <p className={`text-xs ${status.cls}`}>
            {status.label}
            {stateChips.length > 0 && (
              <span className="text-muted"> · {stateChips.join(' · ')}</span>
            )}
          </p>
        </div>
        <span
          aria-hidden
          className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          ⌄
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-elevated bg-bg p-3 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            {c.rating_score != null && (
              <>
                <dt className="text-muted">Bewertung</dt>
                <dd className="text-text tabular-nums">
                  ★ {c.rating_score.toFixed(1)}
                  {c.rating_count != null && ` · ${c.rating_count}`}
                </dd>
              </>
            )}
            {c.verified_at && (
              <>
                <dt className="text-muted">Verifiziert</dt>
                <dd className="text-text tabular-nums">
                  {new Date(c.verified_at).toLocaleDateString('de-DE')}
                </dd>
              </>
            )}
            {c.expires_at && (
              <>
                <dt className="text-muted">Läuft ab</dt>
                <dd className="text-text tabular-nums">
                  {new Date(c.expires_at).toLocaleDateString('de-DE')}
                </dd>
              </>
            )}
          </dl>

          {(c.verified_name || c.verified_picture_url) && !c.hidden && (
            <div className="space-y-1.5 rounded-md bg-surface p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Öffentlich zeigen
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

          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={busy || c.paused}
              title={c.paused ? 'Pausiert' : undefined}
            >
              {busy ? '…' : 'Aktualisieren'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onTogglePause}
              disabled={busy}
            >
              {c.paused ? 'Fortsetzen' : 'Pausieren'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleVisibility}
              disabled={busy}
            >
              {c.hidden ? 'Anzeigen' : 'Verstecken'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} disabled={busy}>
              Trennen
            </Button>
          </div>

          {c.last_error && (
            <p className="rounded-md bg-warning/10 px-2.5 py-1.5 text-[11px] text-warning">
              Refresh-Fehler: {c.last_error}
            </p>
          )}
          {errorMessage && (
            <p className="rounded-md bg-danger/10 px-2.5 py-1.5 text-[11px] text-danger">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
