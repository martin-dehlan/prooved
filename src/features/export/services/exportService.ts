import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { signExport, type ExportPayload, type SignedExport } from '@/shared/lib/solana/signedExport';
import { sha256 } from '@/shared/lib/crypto';

export async function buildSignedExport(userId: string): Promise<SignedExport> {
  const supabase = createSupabaseAdmin();

  const { data: user, error: uErr } = await supabase
    .from('users')
    .select('slug, wallet_address')
    .eq('id', userId)
    .single();
  if (uErr || !user) throw new Error('User not found');

  const { data: connections, error: cErr } = await supabase
    .from('connections')
    .select('platform, tier, rating_score, rating_count, verified_at, on_chain_tx_id')
    .eq('user_id', userId)
    .not('verified_at', 'is', null);
  if (cErr) throw cErr;

  const payload: ExportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    subject: {
      slug: user.slug,
      walletAddress: user.wallet_address ?? undefined,
    },
    connections: (connections ?? []).map((c) => ({
      platform: c.platform,
      tier: c.tier,
      ratingScore: c.rating_score,
      ratingCount: c.rating_count,
      verifiedAt: c.verified_at!,
      onChainTxId: c.on_chain_tx_id,
    })),
  };

  const signed = signExport(payload);

  await supabase.from('data_exports').insert({
    user_id: userId,
    payload_hash: sha256(JSON.stringify(signed)),
  });

  return signed;
}
