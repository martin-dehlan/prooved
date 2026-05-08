'use client';

import { useState } from 'react';
import { computeTrust, type Tier } from '@/shared/lib/trust';
import type { Connection } from '@/features/connections/types/connection.types';

const TIER_STYLE: Record<Tier, string> = {
  neu: 'bg-elevated text-muted',
  bronze: 'bg-warning/15 text-warning',
  silver: 'bg-elevated text-text',
  gold: 'bg-warning text-bg',
  diamond: 'bg-accent text-white',
};

const TIER_GLYPH: Record<Tier, string> = {
  neu: '◌',
  bronze: '◐',
  silver: '◑',
  gold: '◕',
  diamond: '◆',
};

export function TrustScoreCard({ connections }: { connections: Connection[] }) {
  const [open, setOpen] = useState(false);
  const score = computeTrust({ connections });

  return (
    <section className="space-y-3 rounded-2xl border border-elevated bg-surface p-5">
      <header className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-text">Dein Trust-Score</h2>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${TIER_STYLE[score.tier]}`}
        >
          <span aria-hidden>{TIER_GLYPH[score.tier]}</span>
          {score.tierLabel}
        </span>
      </header>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-text">{score.total}</span>
        <span className="text-sm text-muted">/ 100</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${score.total}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-muted underline-offset-2 hover:text-text hover:underline"
      >
        {open ? 'Breakdown verbergen' : 'Breakdown anzeigen'}
      </button>

      {open && (
        <div className="space-y-3 border-t border-elevated pt-3">
          {score.components.map((c) => (
            <div key={c.id} className="space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted">{c.label}</span>
                <span className="font-medium text-text">
                  {c.earned > 0 ? '+' : ''}
                  {c.earned}
                  {c.max > 0 ? ` / ${c.max}` : ''}
                </span>
              </div>
              {c.max > 0 && (
                <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${Math.max(0, (c.earned / c.max) * 100)}%` }}
                  />
                </div>
              )}
              {c.detail.length > 0 && (
                <ul className="ml-1 mt-1 space-y-0.5 text-xs text-muted">
                  {c.detail.map((d, i) => (
                    <li key={i}>• {d}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {score.suggestions.length > 0 && (
        <div className="space-y-2 rounded-xl bg-elevated p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            So erhöhst du deinen Score
          </p>
          {score.suggestions.map((s, i) => (
            <div key={i} className="flex items-baseline gap-2 text-sm">
              <span className="font-bold text-accent">+{s.delta}</span>
              <span className="text-text">{s.text}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
