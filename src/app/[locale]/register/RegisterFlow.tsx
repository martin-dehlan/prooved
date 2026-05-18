'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { MagicLinkForm, SlugOnboardingForm, useAuth } from '@/features/auth';
import { supabase } from '@/shared/lib/supabase/client';

export function RegisterFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const tCommon = useTranslations('Common');
  const redirect = params.get('redirect') ?? '/dashboard';
  const { loading, authUserId, appUser } = useAuth();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [authUserId]);

  useEffect(() => {
    if (authUserId && appUser) router.replace(redirect);
  }, [authUserId, appUser, redirect, router]);

  if (loading) return <p className="text-sm text-muted">{tCommon('loading')}</p>;
  if (authUserId && appUser) return null;

  if (authUserId && !appUser && email) {
    return <SlugOnboardingForm authUserId={authUserId} email={email} />;
  }

  return <MagicLinkForm redirectTo={redirect} />;
}
