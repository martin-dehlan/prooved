import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { notifyAdminOfReport } from '@/shared/lib/email/notify';
import { REPORT_REASON_LABELS, type ReportInput } from '@/features/report/types/report.schemas';

export async function submitReport(input: ReportInput & { reporterIp: string }): Promise<void> {
  const supabase = createSupabaseAdmin();

  const { data: target, error: tErr } = await supabase
    .from('users')
    .select('id')
    .eq('slug', input.targetSlug)
    .maybeSingle();
  if (tErr || !target) throw new Error('Profil nicht gefunden');

  const { error } = await supabase.from('reports').insert({
    target_id: target.id,
    reporter_ip: input.reporterIp,
    reason: input.reason,
    evidence: input.evidence ?? null,
  });
  if (error) throw error;

  void notifyAdminOfReport({
    targetSlug: input.targetSlug,
    reason: input.reason,
    reasonLabel: REPORT_REASON_LABELS[input.reason],
    evidence: input.evidence,
    reporterIp: input.reporterIp,
  });
}
