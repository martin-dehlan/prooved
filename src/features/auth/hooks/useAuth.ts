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

    supabase.auth.getSession().then(async ({ data }) => {
      const id = data.session?.user.id ?? null;
      if (!alive) return;
      setAuthUserId(id);
      if (id) {
        try {
          const profile = await getAppUser(id);
          if (alive) setAppUser(profile);
        } catch {
          if (alive) setAppUser(null);
        }
      }
      if (alive) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const id = session?.user.id ?? null;
      setAuthUserId(id);
      if (!id) {
        setAppUser(null);
        return;
      }
      try {
        const profile = await getAppUser(id);
        setAppUser(profile);
      } catch {
        setAppUser(null);
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, authUserId, appUser };
}
