export { useAuth } from './hooks/useAuth';
export { useSlugAvailability } from './hooks/useSlugAvailability';
export { MagicLinkForm } from './components/MagicLinkForm';
export { SlugOnboardingForm } from './components/SlugOnboardingForm';
export {
  sendMagicLink,
  signOut,
  getAppUser,
  isSlugAvailable,
  createUserProfile,
} from './services/authService';
export type { AppUser, AuthState } from './types/auth.types';
export {
  magicLinkSchema,
  onboardingSchema,
  type MagicLinkInput,
  type OnboardingInput,
} from './types/auth.schemas';
