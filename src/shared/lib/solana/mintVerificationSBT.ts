// Mint a Soulbound Verification Token via Metaplex Token Metadata.
// Phase 3 — stub. Real impl needs umi setup and a deploy wallet w/ SOL.
//
// Dependencies (already in package.json):
//   @metaplex-foundation/mpl-token-metadata, @metaplex-foundation/umi,
//   @metaplex-foundation/umi-bundle-defaults — install only when wiring up:
//     npm install @metaplex-foundation/{mpl-token-metadata,umi,umi-bundle-defaults}

import type { Platform, Tier } from '@/shared/types/platform.types';

export interface SBTMetadata {
  platform: Platform;
  tier: Extract<Tier, 'gold' | 'silver'>;
  verifiedAt: string;
  proovedSlug: string;
  ratingCount?: number;
}

export interface MintResult {
  txId: string;
  mintAddress: string;
}

export async function mintVerificationSBT(_args: {
  recipientWallet: string;
  metadata: SBTMetadata;
}): Promise<MintResult> {
  // TODO Phase 3:
  // 1. const umi = createUmi(env.SOLANA_RPC_URL).use(mplTokenMetadata());
  // 2. const mint = generateSigner(umi);
  // 3. createV1({ mint, name, uri, sellerFeeBasisPoints: 0, isMutable: false, ... }).sendAndConfirm()
  // 4. mintV1({ mint, authority, amount: 1, tokenStandard: NonFungible, ... }).sendAndConfirm()
  // 5. lockToken to make it soulbound (or use TokenStandard: NonFungibleEdition)
  throw new Error('mintVerificationSBT not implemented yet — Phase 3');
}
