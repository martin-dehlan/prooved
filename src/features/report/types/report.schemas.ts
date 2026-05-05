import { z } from 'zod';

export const REPORT_REASONS = [
  'fake_account',
  'fraud',
  'wrong_identity',
  'other',
] as const;

export const reportSchema = z.object({
  targetSlug: z.string().min(1),
  reason: z.enum(REPORT_REASONS),
  evidence: z.string().max(2000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const REPORT_REASON_LABELS: Record<(typeof REPORT_REASONS)[number], string> = {
  fake_account: 'Fake-Account',
  fraud: 'Betrug bei Verkauf',
  wrong_identity: 'Falsche Identität',
  other: 'Sonstiges',
};
