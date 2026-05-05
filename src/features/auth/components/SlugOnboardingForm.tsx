'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label } from '@/shared/components/ui';
import { createUserProfile } from '@/features/auth/services/authService';
import { useSlugAvailability } from '@/features/auth/hooks/useSlugAvailability';
import { onboardingSchema, type OnboardingInput } from '@/features/auth/types/auth.schemas';

export function SlugOnboardingForm({
  authUserId,
  email,
  defaultName,
}: {
  authUserId: string;
  email: string;
  defaultName?: string;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: defaultName ?? '' },
  });

  const slug = watch('slug') ?? '';
  const status = useSlugAvailability(slug);

  const onSubmit = handleSubmit(async ({ slug, name }) => {
    if (status === 'taken' || status === 'reserved') {
      setError('slug', { message: 'Dieser Name ist bereits vergeben' });
      return;
    }
    try {
      await createUserProfile({ authUserId, email, slug, name });
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setError('slug', { message: e instanceof Error ? e.message : 'Fehler beim Anlegen' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Anzeigename (optional)</Label>
        <Input id="name" placeholder="Max Mustermann" {...register('name')} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Profil-Adresse</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">prooved.de/</span>
          <Input id="slug" placeholder="max-mustermann" {...register('slug')} />
        </div>
        <SlugStatus status={status} />
        {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
        <p className="text-xs text-zinc-500">
          Achtung: dein Profil-Slug ist nach dem Anlegen nicht mehr änderbar.
        </p>
      </div>
      <Button type="submit" disabled={isSubmitting || status !== 'available'} className="w-full">
        {isSubmitting ? 'Lege an…' : 'Profil anlegen'}
      </Button>
    </form>
  );
}

function SlugStatus({ status }: { status: ReturnType<typeof useSlugAvailability> }) {
  const map: Record<typeof status, { text: string; cls: string }> = {
    idle:      { text: '',                               cls: '' },
    invalid:   { text: 'Ungültiges Format',              cls: 'text-red-600' },
    reserved:  { text: 'Reserviert',                     cls: 'text-red-600' },
    checking:  { text: 'Prüfe Verfügbarkeit…',           cls: 'text-zinc-500' },
    available: { text: '✓ Verfügbar',                    cls: 'text-emerald-600' },
    taken:     { text: 'Bereits vergeben',               cls: 'text-red-600' },
    error:     { text: 'Verfügbarkeit konnte nicht geprüft werden', cls: 'text-red-600' },
  };
  const { text, cls } = map[status];
  return text ? <p className={`text-xs ${cls}`}>{text}</p> : null;
}
