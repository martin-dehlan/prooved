import type { Platform, PlatformAdapter } from '@/shared/types/platform.types';
import { ebayAdapter } from './ebay';
import { paypalAdapter } from './paypal';
import { vintedAdapter } from './vinted';
import { kleinanzeigenAdapter } from './kleinanzeigen';

export const ADAPTERS: Record<Platform, PlatformAdapter> = {
  ebay: ebayAdapter,
  paypal: paypalAdapter,
  vinted: vintedAdapter,
  kleinanzeigen: kleinanzeigenAdapter,
};

export { ebayAdapter, paypalAdapter, vintedAdapter, kleinanzeigenAdapter };
