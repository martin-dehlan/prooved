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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          Profil einrichten
        </h1>
        <p className="mt-2 text-sm text-muted">
          Wähle deine Profil-Adresse. Sie ist später nicht mehr änderbar.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Anzeigename (optional)</Label>
          <Input id="name" placeholder="Max Mustermann" {...register('name')} />
          {errors.name && <p className="text-sm text-danger">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Profil-Adresse</Label>
          <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-elevated bg-surface focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2">
            <span className="flex items-center bg-elevated px-3 text-sm font-medium text-muted">
              prooved.de/
            </span>
            <input
              id="slug"
              placeholder="max-mustermann"
              className="flex-1 bg-transparent px-3 text-base text-text outline-none placeholder:text-muted"
              {...register('slug')}
            />
          </div>
          <SlugStatus status={status} />
          {errors.slug && <p className="text-sm text-danger">{errors.slug.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || status !== 'available'}
          block
          size="lg"
        >
          {isSubmitting ? 'Lege an…' : 'Profil anlegen'}
        </Button>
      </form>
    </div>
  );
}

function SlugStatus({ status }: { status: ReturnType<typeof useSlugAvailability> }) {
  const map: Record<typeof status, { text: string; cls: string }> = {
    idle:      { text: '',                                            cls: '' },
    invalid:   { text: 'Ungültig — nur a-z, 0-9, Bindestrich',         cls: 'text-danger' },
    reserved:  { text: 'Reserviert',                                   cls: 'text-danger' },
    checking:  { text: 'Prüfe…',                                       cls: 'text-muted' },
    available: { text: '✓ Verfügbar',                                  cls: 'text-accent' },
    taken:     { text: 'Bereits vergeben',                             cls: 'text-danger' },
    error:     { text: 'Verfügbarkeit nicht prüfbar',                  cls: 'text-danger' },
  };
  const { text, cls } = map[status];
  return text ? <p className={`text-sm ${cls}`}>{text}</p> : null;
}
