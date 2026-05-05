import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Verifies an Ed25519 signature produced by Phantom/Solflare signMessage().
// nonce: original UTF-8 string the user signed.
// signature: base58 (Phantom) or base64.
// publicKey: base58 Solana address.
export function verifyWalletSignature(args: {
  nonce: string;
  signature: string;
  publicKey: string;
}): boolean {
  const { nonce, signature, publicKey } = args;
  let sigBytes: Uint8Array;
  try {
    sigBytes = bs58.decode(signature);
  } catch {
    sigBytes = Uint8Array.from(Buffer.from(signature, 'base64'));
  }
  const pubBytes = bs58.decode(publicKey);
  const msgBytes = new TextEncoder().encode(nonce);
  return nacl.sign.detached.verify(msgBytes, sigBytes, pubBytes);
}
