import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { verifyWalletSignature } from '@/shared/lib/solana/verifySignature';
import { randomHex } from '@/shared/lib/crypto';

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const nonces = new Map<string, { nonce: string; expiresAt: number }>();

export function issueNonce(userId: string): string {
  const nonce = `PR-verify-${randomHex(16)}`;
  nonces.set(userId, { nonce, expiresAt: Date.now() + NONCE_TTL_MS });
  return nonce;
}

export function consumeNonce(userId: string, nonce: string): boolean {
  const entry = nonces.get(userId);
  if (!entry) return false;
  if (entry.nonce !== nonce) return false;
  if (entry.expiresAt < Date.now()) {
    nonces.delete(userId);
    return false;
  }
  nonces.delete(userId);
  return true;
}

export async function verifyAndPersistWallet(args: {
  userId: string;
  address: string;
  signature: string;
  nonce: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!consumeNonce(args.userId, args.nonce)) {
    return { ok: false, reason: 'Nonce ungültig oder abgelaufen' };
  }
  const valid = verifyWalletSignature({
    nonce: args.nonce,
    signature: args.signature,
    publicKey: args.address,
  });
  if (!valid) return { ok: false, reason: 'Signatur ungültig' };

  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();

  await supabase.from('wallet_proofs').insert({
    user_id: args.userId,
    wallet_address: args.address,
    nonce: args.nonce,
    signature: args.signature,
  });

  await supabase
    .from('users')
    .update({ wallet_address: args.address, wallet_verified_at: now })
    .eq('id', args.userId);

  return { ok: true };
}

export async function disconnectWallet(userId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  await supabase
    .from('users')
    .update({ wallet_address: null, wallet_verified_at: null })
    .eq('id', userId);
  await supabase.from('wallet_proofs').delete().eq('user_id', userId);
}
