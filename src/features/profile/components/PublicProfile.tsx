import Link from 'next/link';
import { Card, CardContent } from '@/shared/components/ui';
import { PlatformBadge } from '@/shared/components/profile/PlatformBadge';
import { ExpiryWarning } from '@/shared/components/profile/ExpiryWarning';
import { RatingDisplay } from '@/shared/components/profile/RatingDisplay';
import { PLATFORM_LABELS } from '@/shared/types/platform.types';
import type { PublicProfile as PublicProfileData } from '@/features/profile/services/profileService';
import { CopyLinkButton } from './CopyLinkButton';

export function PublicProfile({ data }: { data: PublicProfileData }) {
  const { user, connections } = data;

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{user.name ?? user.slug}</h1>
        <p className="text-sm text-zinc-500">
          Prooved seit{' '}
          {new Date(user.created_at).toLocaleDateString('de-DE', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
        {user.wallet_address && user.wallet_verified_at && (
          <p className="text-sm text-emerald-700">
            ◎{' '}
            <a
              href={`https://explorer.solana.com/address/${user.wallet_address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Wallet verifiziert
            </a>
          </p>
        )}
      </header>

      {connections.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          Noch keine verifizierten Plattformen.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {connections.map((c) => (
            <li key={c.id}>
              <Card>
                <CardContent className="space-y-2">
                  <PlatformBadge platform={c.platform} tier={c.tier} />
                  <RatingDisplay score={c.rating_score} count={c.rating_count} />
                  <p className="text-xs text-zinc-500">
                    Quelle: {PLATFORM_LABELS[c.platform]}
                    {c.verified_at &&
                      ', verifiziert am ' +
                        new Date(c.verified_at).toLocaleDateString('de-DE')}
                  </p>
                  <ExpiryWarning expiresAt={c.expires_at} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-sm">
        <Link
          href={`/${user.slug}/report`}
          className="text-zinc-700 underline-offset-4 hover:underline"
        >
          Profil melden
        </Link>
        <CopyLinkButton slug={user.slug} />
        <span className="ml-auto text-xs text-zinc-400">Powered by Prooved</span>
      </footer>
    </div>
  );
}
