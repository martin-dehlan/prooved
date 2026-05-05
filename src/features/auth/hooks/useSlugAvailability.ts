'use client';

import { useEffect, useState } from 'react';
import { isSlugAvailable } from '@/features/auth/services/authService';
import { SLUG_REGEX, RESERVED_SLUGS } from '@/shared/lib/utils/slug';

type Status = 'idle' | 'invalid' | 'reserved' | 'checking' | 'available' | 'taken' | 'error';
type AsyncStatus = 'checking' | 'available' | 'taken' | 'error';

function staticStatus(slug: string): Status | null {
  if (slug.length === 0) return 'idle';
  if (!SLUG_REGEX.test(slug) || slug.length < 3) return 'invalid';
  if (RESERVED_SLUGS.has(slug)) return 'reserved';
  return null;
}

export function useSlugAvailability(slug: string, debounceMs = 400) {
  const sync = staticStatus(slug);
  const [asyncResult, setAsyncResult] = useState<{ slug: string; status: AsyncStatus } | null>(null);

  useEffect(() => {
    if (staticStatus(slug) !== null) return;
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const available = await isSlugAvailable(slug);
        if (!cancelled) setAsyncResult({ slug, status: available ? 'available' : 'taken' });
      } catch {
        if (!cancelled) setAsyncResult({ slug, status: 'error' });
      }
    }, debounceMs);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [slug, debounceMs]);

  if (sync !== null) return sync;
  if (asyncResult?.slug === slug) return asyncResult.status;
  return 'checking';
}
