'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Connection } from '@/features/connections/types/connection.types';
import { PlatformIcon } from '@/shared/components/ui/PlatformIcon';

type Source = 'paypal' | 'linkedin' | 'github' | 'none' | null;

const SOURCE_LABEL: Record<NonNullable<Source>, string> = {
  paypal: 'PayPal',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  none: 'Keins',
};

async function setSource(source: Source): Promise<{ ok: boolean }> {
  const res = await fetch('/api/profile/avatar-source', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });
  if (!res.ok) throw new Error('Update fehlgeschlagen');
  return res.json();
}

export function AvatarSettings({
  userId,
  current,
  connections,
  initials,
}: {
  userId: string;
  current: Source;
  connections: Connection[];
  initials: string;
}) {
  const qc = useQueryClient();
  const [optimistic, setOptimistic] = useState<Source>(current);
  const mutation = useMutation({
    mutationFn: setSource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  // Discover available sources from existing connections with picture
  const available = (['paypal', 'linkedin', 'github'] as const).filter((p) =>
    connections.some(
      (c) => c.platform === p && c.verified_picture_url && c.show_picture,
    ),
  );

  const choose = (source: Source) => {
    setOptimistic(source);
    mutation.mutate(source);
  };

  const isAuto = optimistic == null;
  const isNone = optimistic === 'none';
  const previewUrl = (() => {
    if (isNone) return null;
    if (optimistic === 'paypal' || optimistic === 'linkedin' || optimistic === 'github') {
      return (
        connections.find(
          (c) => c.platform === optimistic && c.verified_picture_url,
        )?.verified_picture_url ?? null
      );
    }
    // Auto: pick first available
    for (const p of ['paypal', 'linkedin', 'github'] as const) {
      const c = connections.find(
        (x) => x.platform === p && x.show_picture && x.verified_picture_url,
      );
      if (c?.verified_picture_url) return c.verified_picture_url;
    }
    return null;
  })();

  if (available.length === 0 && current === null) {
    return null; // Nothing to choose from yet
  }

  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Profilbild
        </h2>
        {mutation.isPending && (
          <span className="text-[11px] text-muted">speichert…</span>
        )}
      </header>

      <div className="flex items-center gap-4 rounded-lg border border-elevated bg-surface p-4">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Vorschau"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
            referrerPolicy="no-referrer"
            unoptimized
          />
        ) : (
          <div
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-text text-lg font-semibold text-bg"
          >
            {initials}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Choice
            label="Auto"
            active={isAuto}
            onClick={() => choose(null)}
            disabled={mutation.isPending}
          />
          {available.map((p) => (
            <Choice
              key={p}
              label={SOURCE_LABEL[p]}
              icon={<PlatformIcon platform={p} size={12} />}
              active={optimistic === p}
              onClick={() => choose(p)}
              disabled={mutation.isPending}
            />
          ))}
          <Choice
            label="Initialen"
            active={isNone}
            onClick={() => choose('none')}
            disabled={mutation.isPending}
          />
        </div>
      </div>

      {available.length === 0 && !isNone && (
        <p className="text-[11px] text-muted">
          Verknüpfe PayPal, LinkedIn oder GitHub um deren Profilbild nutzen zu können.
        </p>
      )}
    </section>
  );
}

function Choice({
  label,
  icon,
  active,
  onClick,
  disabled,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-elevated text-text hover:border-muted/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
