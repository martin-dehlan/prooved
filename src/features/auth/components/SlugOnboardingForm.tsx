'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
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
  const t = useTranslations('SlugOnboarding');
  const tSlug = useTranslations('SlugSchema');
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
      setError('slug', { message: 'taken' });
      return;
    }
    try {
      await createUserProfile({ authUserId, email, slug, name });
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setError('slug', { message: e instanceof Error ? e.message : 'create' });
    }
  });

  function translateSlugError(msg: string): string {
    if (msg === 'taken') return t('errorTaken');
    if (msg === 'create') return t('errorCreate');
    if (msg === 'nameMinError') return t('nameMinError');
    if (tSlug.has(msg)) return tSlug(msg);
    return msg;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t('intro')}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('nameLabel')}</Label>
          <Input id="name" placeholder={t('namePlaceholder')} {...register('name')} />
          {errors.name?.message && (
            <p className="text-sm text-danger">{translateSlugError(errors.name.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">{t('slugLabel')}</Label>
          <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-elevated bg-surface focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2">
            <span className="flex items-center bg-elevated px-3 text-sm font-medium text-muted">
              {t('slugPrefix')}
            </span>
            <input
              id="slug"
              placeholder={t('slugPlaceholder')}
              className="flex-1 bg-transparent px-3 text-base text-text outline-none placeholder:text-muted"
              {...register('slug')}
            />
          </div>
          <SlugStatus status={status} />
          {errors.slug?.message && (
            <p className="text-sm text-danger">{translateSlugError(errors.slug.message)}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || status !== 'available'}
          block
          size="lg"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  );
}

function SlugStatus({ status }: { status: ReturnType<typeof useSlugAvailability> }) {
  const t = useTranslations('SlugOnboarding');
  const map: Record<typeof status, { text: string; cls: string }> = {
    idle:      { text: '',                    cls: '' },
    invalid:   { text: t('statusInvalid'),    cls: 'text-danger' },
    reserved:  { text: t('statusReserved'),   cls: 'text-danger' },
    checking:  { text: t('statusChecking'),   cls: 'text-muted' },
    available: { text: t('statusAvailable'),  cls: 'text-accent' },
    taken:     { text: t('statusTaken'),      cls: 'text-danger' },
    error:     { text: t('statusError'),      cls: 'text-danger' },
  };
  const { text, cls } = map[status];
  return text ? <p className={`text-sm ${cls}`}>{text}</p> : null;
}
