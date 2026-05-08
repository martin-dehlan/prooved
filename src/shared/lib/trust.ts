// Prooved Trust Score
// ====================
// Pure function over visible (non-hidden) verified connections.
// Output: { total, tier, components, suggestions }.
//
// Designed to be transparent — every point traceable to a single rule.
// No hidden weights, no arbitrary boosts. Aligned to user mental model:
// reviews > activity > identity (per CLAUDE.md product owner).

import type { Connection } from '@/features/connections/types/connection.types';

export type Tier = 'neu' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface ScoreComponent {
  id: 'identity' | 'marketplace' | 'volume' | 'longevity' | 'activity' | 'penalty';
  label: string;
  earned: number;
  max: number;
  detail: string[];
}

export interface TrustScore {
  total: number;
  tier: Tier;
  tierLabel: string;
  components: ScoreComponent[];
  /** Hint cards: "+X by doing Y" — actionable suggestions. */
  suggestions: { delta: number; text: string }[];
}

const TIER_THRESHOLDS: { min: number; tier: Tier; label: string }[] = [
  { min: 90, tier: 'diamond', label: 'Diamond' },
  { min: 70, tier: 'gold', label: 'Gold' },
  { min: 50, tier: 'silver', label: 'Silver' },
  { min: 30, tier: 'bronze', label: 'Bronze' },
  { min: 0, tier: 'neu', label: 'Neu' },
];

function tierFor(total: number): { tier: Tier; tierLabel: string } {
  for (const t of TIER_THRESHOLDS) {
    if (total >= t.min) return { tier: t.tier, tierLabel: t.label };
  }
  return { tier: 'neu', tierLabel: 'Neu' };
}

const KYC_PLATFORMS = ['paypal', 'linkedin'] as const;
const MARKETPLACE_PLATFORMS = [
  'ebay',
  'paypal',
  'etsy',
  'vinted',
  'kleinanzeigen',
  'willhaben',
  'shpock',
  'discogs',
] as const;

interface ScoreInput {
  connections: Connection[];
  reportCount?: number;
}

export function computeTrust({ connections, reportCount = 0 }: ScoreInput): TrustScore {
  const visible = connections.filter((c) => !c.hidden && c.verified_at);
  const allConnections = connections.filter((c) => c.verified_at);

  // -------- Identity (max 30)
  const identity = computeIdentity(visible);

  // -------- Marketplace (max 40)
  const marketplace = computeMarketplace(visible);

  // -------- Volume (max 15) — log-scaled total ratings
  const volume = computeVolume(visible);

  // -------- Longevity (max 10) — oldest verified member-since
  const longevity = computeLongevity(visible);

  // -------- Activity (max 5) — all visible connections fresh
  const activity = computeActivity(visible);

  // -------- Penalty (negative)
  const penalty = computePenalty(allConnections, visible.length, reportCount);

  const totalEarned =
    identity.earned +
    marketplace.earned +
    volume.earned +
    longevity.earned +
    activity.earned +
    penalty.earned;

  const total = Math.max(0, Math.min(100, Math.round(totalEarned)));
  const { tier, tierLabel } = tierFor(total);

  const suggestions = buildSuggestions({ visible, identity, marketplace, longevity });

  return {
    total,
    tier,
    tierLabel,
    components: [identity, marketplace, volume, longevity, activity, penalty],
    suggestions,
  };
}

// -- Identity -----------------------------------------------------------

function computeIdentity(visible: Connection[]): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;

  const kyc = visible.find((c) => KYC_PLATFORMS.includes(c.platform as 'paypal' | 'linkedin'));
  if (kyc) {
    earned += 20;
    detail.push(
      `+20 KYC-Verifikation (${kyc.platform === 'paypal' ? 'PayPal' : 'LinkedIn'})`,
    );
    if (kyc.verified_name && kyc.show_name) {
      earned += 5;
      detail.push('+5 Klarname öffentlich');
    }
    if (kyc.verified_picture_url && kyc.show_picture) {
      earned += 5;
      detail.push('+5 Profilbild verifiziert');
    }
  } else {
    detail.push('Keine KYC-Plattform verbunden (PayPal / LinkedIn)');
  }

  return { id: 'identity', label: 'Identität', earned, max: 30, detail };
}

// -- Marketplace --------------------------------------------------------

function computeMarketplace(visible: Connection[]): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;

  const marketplaces = visible.filter((c) =>
    MARKETPLACE_PLATFORMS.includes(c.platform as (typeof MARKETPLACE_PLATFORMS)[number]),
  );

  // PayPal counts as identity not marketplace for scoring purposes
  const realMarketplaces = marketplaces.filter((c) => c.platform !== 'paypal');

  if (realMarketplaces.length >= 4) {
    earned += 30;
    detail.push(`+30 ${realMarketplaces.length} Marktplätze`);
  } else if (realMarketplaces.length >= 2) {
    earned += 20;
    detail.push(`+20 ${realMarketplaces.length} Marktplätze`);
  } else if (realMarketplaces.length === 1) {
    earned += 10;
    detail.push('+10 1 Marktplatz');
  } else {
    detail.push('Keine Marktplatz-Verifikation');
  }

  // Quality bonus from eBay positive %
  const ebay = realMarketplaces.find((c) => c.platform === 'ebay');
  if (ebay && (ebay.positive_count ?? 0) + (ebay.negative_count ?? 0) >= 10) {
    const total = (ebay.positive_count ?? 0) + (ebay.negative_count ?? 0);
    const pct = ((ebay.positive_count ?? 0) / total) * 100;
    if (pct >= 95) {
      earned += 10;
      detail.push(`+10 ${pct.toFixed(1).replace('.', ',')} % positiv (eBay)`);
    } else if (pct >= 90) {
      earned += 5;
      detail.push(`+5 ${pct.toFixed(1).replace('.', ',')} % positiv (eBay)`);
    } else {
      detail.push(`+0 ${pct.toFixed(1).replace('.', ',')} % positiv (eBay)`);
    }
  }

  return { id: 'marketplace', label: 'Marktplatz-Reputation', earned, max: 40, detail };
}

// -- Volume -------------------------------------------------------------

function computeVolume(visible: Connection[]): ScoreComponent {
  const total = visible.reduce((sum, c) => sum + (c.rating_count ?? 0), 0);
  const detail: string[] = [];
  let earned = 0;

  if (total >= 100) {
    earned = 15;
    detail.push(`+15 ${total.toLocaleString('de-DE')} Bewertungen`);
  } else if (total >= 10) {
    earned = 10;
    detail.push(`+10 ${total} Bewertungen`);
  } else if (total >= 1) {
    earned = 5;
    detail.push(`+5 ${total} Bewertungen`);
  } else {
    detail.push('Noch keine Bewertungen');
  }

  return { id: 'volume', label: 'Bewertungs-Volumen', earned, max: 15, detail };
}

// -- Longevity ----------------------------------------------------------

function computeLongevity(visible: Connection[]): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;
  let oldestMs = Infinity;

  for (const c of visible) {
    if (!c.member_since) continue;
    const t = new Date(c.member_since).getTime();
    if (!Number.isNaN(t) && t < oldestMs) oldestMs = t;
  }

  if (oldestMs === Infinity) {
    detail.push('Keine Mitgliedschafts-Daten verfügbar');
    return { id: 'longevity', label: 'Langlebigkeit', earned, max: 10, detail };
  }

  const ageYears = (Date.now() - oldestMs) / (1000 * 60 * 60 * 24 * 365);
  const oldestYear = new Date(oldestMs).getFullYear();

  if (ageYears >= 5) {
    earned = 10;
    detail.push(`+10 aktiv seit ${oldestYear}`);
  } else if (ageYears >= 2) {
    earned = 5;
    detail.push(`+5 aktiv seit ${oldestYear}`);
  } else if (ageYears >= 1) {
    earned = 2;
    detail.push(`+2 aktiv seit ${oldestYear}`);
  } else {
    detail.push(`Account seit ${oldestYear} (< 1 Jahr)`);
  }

  return { id: 'longevity', label: 'Langlebigkeit', earned, max: 10, detail };
}

// -- Activity -----------------------------------------------------------

function computeActivity(visible: Connection[]): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;
  if (visible.length === 0) {
    detail.push('Keine aktiven Verbindungen');
    return { id: 'activity', label: 'Aktivität', earned, max: 5, detail };
  }

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const allFresh = visible.every((c) => {
    if (!c.last_fetched) return false;
    return now - new Date(c.last_fetched).getTime() < sevenDays;
  });

  if (allFresh) {
    earned = 5;
    detail.push('+5 alle Verbindungen frisch (≤ 7 Tage)');
  } else {
    detail.push('Manche Verbindungen veraltet (Aktualisieren klicken)');
  }
  return { id: 'activity', label: 'Aktivität', earned, max: 5, detail };
}

// -- Penalty ------------------------------------------------------------

function computePenalty(
  allConnections: Connection[],
  visibleCount: number,
  reportCount: number,
): ScoreComponent {
  const detail: string[] = [];
  let earned = 0; // negative number; 0 = no penalty

  if (reportCount > 0) {
    earned -= 10;
    detail.push(`-10 ${reportCount} bestätigte Meldung${reportCount > 1 ? 'en' : ''}`);
  }

  const failed = allConnections.filter((c) => c.last_error).length;
  if (failed > 0) {
    earned -= 5;
    detail.push(`-5 ${failed} Verbindung${failed > 1 ? 'en' : ''} mit Fehler`);
  }

  // Cherry-picking: more than half of verified connections hidden
  const totalVerified = allConnections.length;
  const hiddenCount = totalVerified - visibleCount;
  if (totalVerified >= 4 && hiddenCount / totalVerified > 0.5) {
    earned -= 10;
    detail.push(`-10 ${hiddenCount} von ${totalVerified} Verbindungen versteckt`);
  }

  if (earned === 0) detail.push('Keine Strafpunkte');

  return { id: 'penalty', label: 'Penalty', earned, max: 0, detail };
}

// -- Suggestions --------------------------------------------------------

function buildSuggestions({
  visible,
  identity,
  marketplace,
  longevity,
}: {
  visible: Connection[];
  identity: ScoreComponent;
  marketplace: ScoreComponent;
  longevity: ScoreComponent;
}): { delta: number; text: string }[] {
  const out: { delta: number; text: string }[] = [];

  // Identity gaps
  const hasKyc = visible.some((c) =>
    KYC_PLATFORMS.includes(c.platform as 'paypal' | 'linkedin'),
  );
  if (!hasKyc) {
    out.push({ delta: 20, text: 'PayPal oder LinkedIn verknüpfen' });
  } else if (identity.earned < identity.max) {
    const kyc = visible.find((c) =>
      KYC_PLATFORMS.includes(c.platform as 'paypal' | 'linkedin'),
    );
    if (kyc?.verified_name && !kyc.show_name) {
      out.push({ delta: 5, text: 'Klarnamen öffentlich anzeigen' });
    }
    if (kyc?.verified_picture_url && !kyc.show_picture) {
      out.push({ delta: 5, text: 'Profilbild öffentlich anzeigen' });
    }
  }

  // Marketplace gaps
  const realMp = visible.filter(
    (c) =>
      MARKETPLACE_PLATFORMS.includes(c.platform as (typeof MARKETPLACE_PLATFORMS)[number]) &&
      c.platform !== 'paypal',
  );
  if (realMp.length === 0) {
    out.push({ delta: 10, text: 'Mindestens 1 Marktplatz verknüpfen' });
  } else if (realMp.length === 1) {
    out.push({ delta: 10, text: 'Zweiten Marktplatz verknüpfen' });
  } else if (realMp.length < 4) {
    out.push({ delta: 10, text: 'Auf 4 Marktplätze ausbauen' });
  }

  if (longevity.earned < longevity.max) {
    out.push({
      delta: 10 - longevity.earned,
      text: 'Langlebigkeit wächst automatisch über die Zeit',
    });
  }

  return out.slice(0, 3); // top 3 actionable
}
