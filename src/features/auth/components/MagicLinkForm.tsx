'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Button, Input, Label } from '@/shared/components/ui';
import { sendMagicLink } from '@/features/auth/services/authService';
import { magicLinkSchema, type MagicLinkInput } from '@/features/auth/types/auth.schemas';

export function MagicLinkForm({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations('Register');
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MagicLinkInput>({ resolver: zodResolver(magicLinkSchema) });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null);
    try {
      await sendMagicLink(email, redirectTo, locale);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorGeneric'));
    }
  });

  if (sent) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center">
        <p className="text-2xl">✉️</p>
        <p className="mt-3 text-base font-semibold text-accent">
          {t('sentTitle')}
        </p>
        <p className="mt-1 text-sm text-accent">
          {t('sentText')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted">
          {t('intro')}
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            {...register('email')}
          />
          {errors.email?.message && (
            <p className="text-sm text-danger">{translateError(t, errors.email.message)}</p>
          )}
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={isSubmitting} block size="lg">
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  );
}

function translateError(t: ReturnType<typeof useTranslations<'Register'>>, msg: string): string {
  return t.has(msg) ? t(msg) : msg;
}
