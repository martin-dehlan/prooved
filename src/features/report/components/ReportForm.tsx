'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Card, CardContent, Input, Label } from '@/shared/components/ui';
import {
  reportSchema,
  REPORT_REASONS,
  type ReportInput,
} from '@/features/report/types/report.schemas';

export function ReportForm({ targetSlug }: { targetSlug: string }) {
  const t = useTranslations('ReportForm');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { targetSlug, reason: 'fake_account' },
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError(t('errorPrefix', { status: res.status }));
      return;
    }
    setDone(true);
  });

  if (done) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-accent">{t('successText')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" {...register('targetSlug')} />
          <div className="space-y-2">
            <Label htmlFor="reason">{t('reasonLabel')}</Label>
            <select
              id="reason"
              {...register('reason')}
              className="flex h-10 w-full rounded-md border border-elevated bg-surface px-3 text-sm"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(`reason.${r}` as 'reason.fake_account' | 'reason.fraud' | 'reason.wrong_identity' | 'reason.other')}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="text-xs text-danger">{errors.reason.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidence">{t('evidenceLabel')}</Label>
            <textarea
              id="evidence"
              {...register('evidence')}
              rows={5}
              className="w-full rounded-md border border-elevated p-3 text-sm"
              placeholder={t('evidencePlaceholder')}
            />
            {errors.evidence && (
              <p className="text-xs text-danger">{errors.evidence.message}</p>
            )}
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
