'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label } from '@/shared/components/ui';
import { sendMagicLink } from '@/features/auth/services/authService';
import { magicLinkSchema, type MagicLinkInput } from '@/features/auth/types/auth.schemas';

export function MagicLinkForm({ redirectTo }: { redirectTo?: string }) {
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
      await sendMagicLink(email, redirectTo);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    }
  });

  if (sent) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Magic Link verschickt. Schau in dein E-Mail-Postfach.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="du@beispiel.de"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Sende…' : 'Magic Link senden'}
      </Button>
    </form>
  );
}
