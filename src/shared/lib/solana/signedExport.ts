import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface ExportPayload {
  version: '1.0';
  exportedAt: string;
  subject: { slug: string; walletAddress?: string };
  connections: Array<{
    platform: string;
    tier: string;
    ratingScore?: number | null;
    ratingCount?: number | null;
    verifiedAt: string;
    onChainTxId?: string | null;
  }>;
}

export interface SignedExport extends ExportPayload {
  signature: string; // hex
  publicKey: string; // hex
}

function getSigningKeypair(): nacl.SignKeyPair {
  const raw = process.env.PROOVED_SIGNING_KEY;
  if (!raw) throw new Error('PROOVED_SIGNING_KEY missing');
  // Accept either 64-byte secret key (hex/base58) or 32-byte seed (hex).
  let secret: Uint8Array;
  if (/^[0-9a-f]+$/i.test(raw)) {
    secret = Uint8Array.from(Buffer.from(raw, 'hex'));
  } else {
    secret = bs58.decode(raw);
  }
  if (secret.length === 32) return nacl.sign.keyPair.fromSeed(secret);
  if (secret.length === 64) return nacl.sign.keyPair.fromSecretKey(secret);
  throw new Error('PROOVED_SIGNING_KEY must be 32-byte seed or 64-byte secret');
}

export function signExport(payload: ExportPayload): SignedExport {
  const kp = getSigningKeypair();
  const message = new TextEncoder().encode(JSON.stringify(payload.connections));
  const sig = nacl.sign.detached(message, kp.secretKey);
  return {
    ...payload,
    signature: Buffer.from(sig).toString('hex'),
    publicKey: Buffer.from(kp.publicKey).toString('hex'),
  };
}

export function verifyExport(signed: SignedExport): boolean {
  const message = new TextEncoder().encode(JSON.stringify(signed.connections));
  return nacl.sign.detached.verify(
    message,
    Uint8Array.from(Buffer.from(signed.signature, 'hex')),
    Uint8Array.from(Buffer.from(signed.publicKey, 'hex')),
  );
}
