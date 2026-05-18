import { z } from 'zod';
import { slugSchema } from '@/shared/lib/utils/slug';

// Error messages are translation keys; resolve them in consuming forms.
export const magicLinkSchema = z.object({
  email: z.string().email('errorInvalid'),
});

export const onboardingSchema = z.object({
  name: z.string().min(2, 'nameMinError').max(64).optional(),
  slug: slugSchema,
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
