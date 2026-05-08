import { z } from 'zod';

export const BIOCODE_PLATFORMS = [
  'vinted',
  'kleinanzeigen',
  'discogs',
  'willhaben',
  'shpock',
  'custom',
] as const;
export type BioCodePlatform = (typeof BIOCODE_PLATFORMS)[number];

export const platformSchema = z.enum([
  'ebay',
  'vinted',
  'kleinanzeigen',
  'paypal',
  'website',
  'etsy',
  'github',
  'linkedin',
  'discogs',
  'willhaben',
  'shpock',
  'custom',
]);

export const verifyBioCodeSchema = z.object({
  platform: z.enum(BIOCODE_PLATFORMS),
  platformUrl: z.string().min(2),
  customLabel: z.string().min(1).max(60).optional(),
});

export type VerifyBioCodeInput = z.infer<typeof verifyBioCodeSchema>;
