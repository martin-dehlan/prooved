'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardContent, Input, Label } from '@/shared/components/ui';
import {
  reportSchema,
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  type ReportInput,
} from '@/features/report/types/report.schemas';

export function ReportForm({ targetSlug }: { targetSlug: string }) {
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
      setError(`Fehler: ${res.status}`);
      return;
    }
    setDone(true);
  });

  if (done) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-accent">
            Danke. Deine Meldung wurde übermittelt und wird geprüft.
          </p>
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
            <Label htmlFor="reason">Grund</Label>
            <select
              id="reason"
              {...register('reason')}
              className="flex h-10 w-full rounded-md border border-elevated bg-surface px-3 text-sm"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {REPORT_REASON_LABELS[r]}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="text-xs text-danger">{errors.reason.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidence">Beschreibung / Beweise (optional)</Label>
            <textarea
              id="evidence"
              {...register('evidence')}
              rows={5}
              className="w-full rounded-md border border-elevated p-3 text-sm"
              placeholder="Transaktionsnachweis, Screenshot-Link, etc."
            />
            {errors.evidence && (
              <p className="text-xs text-danger">{errors.evidence.message}</p>
            )}
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Sende…' : 'Melden'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
