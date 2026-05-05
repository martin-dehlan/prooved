import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import type { ReportInput } from '@/features/report/types/report.schemas';

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

  // TODO email admin via Resend / Supabase Edge Fn
}
