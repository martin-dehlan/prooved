export type Platform = 'ebay' | 'vinted' | 'kleinanzeigen' | 'paypal';
export type Tier = 'gold' | 'silver' | 'bronze';
export type VerifyMethod = 'oauth' | 'bio_code' | 'scrape';

export interface PlatformProfile {
  platformUserId: string | null;
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  positiveCount: number | null;
  negativeCount: number | null;
  memberSince: string | null;
  /** Free-form, e.g. "verified", "active". Used by PayPal which has no rating. */
  identityVerified?: boolean;
}

export interface PlatformAdapter {
  platform: Platform;
  tier: Tier;
  method: VerifyMethod;
  /** Best-effort fetch of public profile data. Throws on hard failure. */
  fetchProfile(input: { url?: string; accessToken?: string; userId?: string }): Promise<PlatformProfile>;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  ebay: 'eBay',
  paypal: 'PayPal',
  vinted: 'Vinted',
  kleinanzeigen: 'Kleinanzeigen',
};

export const TIER_BADGE: Record<Tier, { label: string; className: string }> = {
  gold:   { label: 'Gold',   className: 'bg-yellow-100 text-yellow-900 ring-yellow-300' },
  silver: { label: 'Silver', className: 'bg-zinc-100  text-zinc-900  ring-zinc-300' },
  bronze: { label: 'Bronze', className: 'bg-amber-100 text-amber-900 ring-amber-300' },
};

export const PLATFORM_TIER: Record<Platform, Tier> = {
  ebay: 'gold',
  paypal: 'gold',
  vinted: 'silver',
  kleinanzeigen: 'silver',
};

export const PLATFORM_METHOD: Record<Platform, VerifyMethod> = {
  ebay: 'oauth',
  paypal: 'oauth',
  vinted: 'bio_code',
  kleinanzeigen: 'bio_code',
};
