import { z } from 'zod';

export const platformSchema = z.enum(['ebay', 'vinted', 'kleinanzeigen', 'paypal']);

export const startBioCodeFlowSchema = z.object({
  platform: z.enum(['vinted', 'kleinanzeigen']),
  platformUrl: z.string().url(),
});

export const verifyBioCodeSchema = z.object({
  connectionId: z.string().uuid(),
});

export type StartBioCodeFlowInput = z.infer<typeof startBioCodeFlowSchema>;
export type VerifyBioCodeInput = z.infer<typeof verifyBioCodeSchema>;
