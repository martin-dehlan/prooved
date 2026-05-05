import { Badge } from '@/shared/components/ui';
import { PLATFORM_LABELS, TIER_BADGE } from '@/shared/types/platform.types';
import type { Platform, Tier } from '@/shared/types/platform.types';

export function PlatformBadge({ platform, tier }: { platform: Platform; tier: Tier }) {
  return (
    <Badge variant={tier as 'gold' | 'silver' | 'bronze'}>
      {PLATFORM_LABELS[platform]} <span className="opacity-60">·</span> {TIER_BADGE[tier].label}
    </Badge>
  );
}
