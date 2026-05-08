import { z } from 'zod';

export const BIOCODE_PLATFORMS = [
  'vinted',
  'kleinanzeigen',
  'discogs',
  'willhaben',
  'shpock',
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
]);

export const verifyBioCodeSchema = z.object({
  platform: z.enum(BIOCODE_PLATFORMS),
  platformUrl: z.string().min(2),
});

export type VerifyBioCodeInput = z.infer<typeof verifyBioCodeSchema>;
