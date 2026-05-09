export type Platform =
  | 'ebay'
  | 'vinted'
  | 'kleinanzeigen'
  | 'paypal'
  | 'website'
  | 'etsy'
  | 'github'
  | 'linkedin'
  | 'discogs'
  | 'willhaben'
  | 'shpock'
  | 'reverb'
  | 'custom';

export type Tier = 'gold' | 'silver' | 'bronze';
export type VerifyMethod = 'oauth' | 'bio_code' | 'scrape' | 'domain_dns' | 'token';

export interface PlatformProfile {
  platformUserId: string | null;
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  positiveCount: number | null;
  negativeCount: number | null;
  memberSince: string | null;
  identityVerified?: boolean;
}

export interface PlatformAdapter {
  platform: Platform;
  tier: Tier;
  method: VerifyMethod;
  fetchProfile(input: { url?: string; accessToken?: string; userId?: string }): Promise<PlatformProfile>;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  ebay: 'eBay',
  paypal: 'PayPal',
  vinted: 'Vinted',
  kleinanzeigen: 'Kleinanzeigen',
  website: 'Website',
  etsy: 'Etsy',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  discogs: 'Discogs',
  willhaben: 'Willhaben',
  shpock: 'Shpock',
  reverb: 'Reverb',
  custom: 'Andere Plattform',
};

export const TIER_BADGE: Record<Tier, { label: string; className: string }> = {
  gold:   { label: 'Gold',   className: 'bg-warning/15 text-warning ring-warning/30' },
  silver: { label: 'Silver', className: 'bg-elevated  text-text  ring-elevated' },
  bronze: { label: 'Bronze', className: 'bg-warning/15 text-warning ring-warning/30' },
};

export const PLATFORM_TIER: Record<Platform, Tier> = {
  ebay: 'gold',
  paypal: 'gold',
  vinted: 'silver',
  kleinanzeigen: 'silver',
  website: 'silver',
  etsy: 'gold',
  github: 'silver',
  linkedin: 'gold',
  discogs: 'silver',
  willhaben: 'silver',
  shpock: 'silver',
  reverb: 'silver',
  custom: 'silver',
};

export const PLATFORM_METHOD: Record<Platform, VerifyMethod> = {
  ebay: 'oauth',
  paypal: 'oauth',
  vinted: 'bio_code',
  kleinanzeigen: 'bio_code',
  website: 'domain_dns',
  etsy: 'oauth',
  github: 'oauth',
  linkedin: 'oauth',
  discogs: 'bio_code',
  willhaben: 'bio_code',
  shpock: 'bio_code',
  reverb: 'bio_code',
  custom: 'bio_code',
};
