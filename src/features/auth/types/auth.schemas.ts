import { z } from 'zod';
import { slugSchema } from '@/shared/lib/utils/slug';

export const magicLinkSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

export const onboardingSchema = z.object({
  name: z.string().min(2, 'Mindestens 2 Zeichen').max(64).optional(),
  slug: slugSchema,
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
