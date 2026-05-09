'use client';

import { useState } from 'react';
import { computeTrust, type Tier } from '@/shared/lib/trust';
import type { Connection } from '@/features/connections/types/connection.types';

const TIER_BG: Record<Tier, string> = {
  neu: 'bg-elevated',
  bronze: 'bg-warning/30',
  silver: 'bg-elevated',
  gold: 'bg-warning',
  diamond: 'bg-accent',
};
const TIER_TEXT: Record<Tier, string> = {
  neu: 'text-muted',
  bronze: 'text-warning',
  silver: 'text-text',
  gold: 'text-bg',
  diamond: 'text-white',
};
const TIER_BAR: Record<Tier, string> = {
  neu: 'bg-muted',
  bronze: 'bg-warning',
  silver: 'bg-text/60',
  gold: 'bg-warning',
  diamond: 'bg-accent',
};

export function TrustScoreCard({ connections }: { connections: Connection[] }) {
  const [open, setOpen] = useState(false);
  const score = computeTrust({ connections });

  return (
    <section className="space-y-3 rounded-lg border border-elevated bg-surface p-4">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Trust-Score
        </h2>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TIER_BG[score.tier]} ${TIER_TEXT[score.tier]}`}
        >
          {score.tierLabel}
        </span>
      </header>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums text-text">
          {score.total}
        </span>
        <span className="text-xs text-muted">/ 100</span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-elevated">
        <div
          className={`h-full rounded-full transition-all ${TIER_BAR[score.tier]}`}
          style={{ width: `${score.total}%` }}
        />
      </div>

      {score.qualityCapped && (
        <p className="rounded-md bg-danger/10 px-2.5 py-1.5 text-[11px] text-danger">
          ⚠ Quote unter 70 % — Score auf Bronze begrenzt.
        </p>
      )}

      {score.suggestions.length > 0 && (
        <ul className="space-y-1 border-t border-elevated pt-3">
          {score.suggestions.map((s, i) => (
            <li key={i} className="flex items-baseline gap-2 text-xs">
              <span className="tabular-nums font-semibold text-accent">+{s.delta}</span>
              <span className="text-text">{s.text}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] text-muted underline-offset-2 hover:text-text hover:underline"
      >
        {open ? 'Details verbergen' : 'Details anzeigen'}
      </button>

      {open && (
        <div className="space-y-3 border-t border-elevated pt-3">
          {score.components
            .filter((c) => c.id !== 'penalty' || c.earned !== 0)
            .map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted">{c.label}</span>
                  <span className="tabular-nums font-medium text-text">
                    {c.earned > 0 ? '+' : ''}
                    {c.earned}
                    {c.max > 0 && <span className="text-muted">/{c.max}</span>}
                  </span>
                </div>
                {c.max > 0 && (
                  <div className="h-0.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${Math.max(0, (c.earned / c.max) * 100)}%` }}
                    />
                  </div>
                )}
                {c.detail.length > 0 && (
                  <ul className="space-y-0.5 pt-1 text-[11px] text-muted">
                    {c.detail.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
