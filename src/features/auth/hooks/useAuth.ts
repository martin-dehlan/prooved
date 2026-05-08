'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { getAppUser } from '@/features/auth/services/authService';
import type { AppUser, AuthState } from '@/features/auth/types/auth.types';

export function useAuth(): AuthState {
  const [loading, setLoading] = useState(true);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    let alive = true;

    async function hydrate(id: string | null) {
      if (!alive) return;
      setAuthUserId(id);
      if (!id) {
        setAppUser(null);
        return;
      }
      try {
        const profile = await getAppUser(id);
        if (alive) setAppUser(profile);
      } catch (err) {
        console.error('[useAuth] getAppUser failed', err);
        if (alive) setAppUser(null);
      }
    }

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) console.error('[useAuth] getSession error', error);
        return hydrate(data.session?.user.id ?? null);
      })
      .catch((err) => {
        console.error('[useAuth] getSession threw', err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrate(session?.user.id ?? null);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, authUserId, appUser };
}
