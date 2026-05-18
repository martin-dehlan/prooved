import type { Platform, PlatformAdapter } from '@/shared/types/platform.types';
import { ebayAdapter } from './ebay';
import { paypalAdapter } from './paypal';
import { vintedAdapter } from './vinted';
import { kleinanzeigenAdapter } from './kleinanzeigen';
import { websiteAdapter } from './website';
import { etsyAdapter } from './etsy';
import { githubAdapter } from './github';
import { linkedinAdapter } from './linkedin';
import { facebookAdapter } from './facebook';
import { discogsAdapter } from './discogs';
import { willhabenAdapter } from './willhaben';
import { shpockAdapter } from './shpock';
import { customAdapter } from './custom';
import { reverbAdapter } from './reverb';

export const ADAPTERS: Record<Platform, PlatformAdapter> = {
  ebay: ebayAdapter,
  paypal: paypalAdapter,
  vinted: vintedAdapter,
  kleinanzeigen: kleinanzeigenAdapter,
  website: websiteAdapter,
  etsy: etsyAdapter,
  github: githubAdapter,
  linkedin: linkedinAdapter,
  facebook: facebookAdapter,
  discogs: discogsAdapter,
  willhaben: willhabenAdapter,
  shpock: shpockAdapter,
  reverb: reverbAdapter,
  custom: customAdapter,
};

export {
  ebayAdapter,
  paypalAdapter,
  vintedAdapter,
  kleinanzeigenAdapter,
  websiteAdapter,
  etsyAdapter,
  githubAdapter,
  linkedinAdapter,
  facebookAdapter,
  discogsAdapter,
  willhabenAdapter,
  shpockAdapter,
  reverbAdapter,
  customAdapter,
};
