'use client';

import { useEffect, type ReactNode } from 'react';
import { initPostHog, posthog, isPostHogReady } from '@/shared/lib/analytics/posthog';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { appUser, loading } = useAuth();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (loading || !isPostHogReady()) return;
    if (appUser) {
      posthog.identify(appUser.id, { slug: appUser.slug });
    } else {
      posthog.reset();
    }
  }, [appUser, loading]);

  return <>{children}</>;
}
