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
export type Locale = 'de' | 'en';

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
  /** Aggregated positive % across visible marketplaces (null if insufficient data). */
  aggregatePositivePct: number | null;
  /** Total visible ratings across all marketplaces. */
  totalRatings: number;
  /** True if score was capped by a quality penalty. */
  qualityCapped: boolean;
}

const TIER_THRESHOLDS: { min: number; tier: Tier; labelDe: string; labelEn: string }[] = [
  { min: 90, tier: 'diamond', labelDe: 'Diamond', labelEn: 'Diamond' },
  { min: 70, tier: 'gold', labelDe: 'Gold', labelEn: 'Gold' },
  { min: 50, tier: 'silver', labelDe: 'Silver', labelEn: 'Silver' },
  { min: 30, tier: 'bronze', labelDe: 'Bronze', labelEn: 'Bronze' },
  { min: 0, tier: 'neu', labelDe: 'Neu', labelEn: 'New' },
];

function tierFor(total: number, locale: Locale): { tier: Tier; tierLabel: string } {
  for (const t of TIER_THRESHOLDS) {
    if (total >= t.min) {
      return { tier: t.tier, tierLabel: locale === 'en' ? t.labelEn : t.labelDe };
    }
  }
  return { tier: 'neu', tierLabel: locale === 'en' ? 'New' : 'Neu' };
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
  'custom',
] as const;

const PLATFORM_DISPLAY: Record<string, string> = {
  ebay: 'eBay',
  paypal: 'PayPal',
  etsy: 'Etsy',
  vinted: 'Vinted',
  kleinanzeigen: 'Kleinanzeigen',
  willhaben: 'Willhaben',
  shpock: 'Shpock',
  discogs: 'Discogs',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  website: 'Website',
  custom: 'Custom',
};

function nameFor(c: Connection): string {
  if (c.platform === 'custom' && c.custom_label) return c.custom_label;
  return PLATFORM_DISPLAY[c.platform] ?? c.platform;
}

function formatPercent(pct: number, locale: Locale): string {
  return locale === 'en'
    ? `${pct.toFixed(1)}%`
    : `${pct.toFixed(1).replace('.', ',')} %`;
}

function formatNumber(n: number, locale: Locale): string {
  return n.toLocaleString(locale === 'en' ? 'en-US' : 'de-DE');
}

// User-facing labels for ScoreComponent.label (also available via TrustScoreCard i18n).
const LABELS: Record<ScoreComponent['id'], { de: string; en: string }> = {
  identity: { de: 'Identität', en: 'Identity' },
  marketplace: { de: 'Marktplatz-Reputation', en: 'Marketplace reputation' },
  volume: { de: 'Bewertungs-Volumen', en: 'Rating volume' },
  longevity: { de: 'Langlebigkeit', en: 'Longevity' },
  activity: { de: 'Aktivität', en: 'Activity' },
  penalty: { de: 'Penalty', en: 'Penalty' },
};

function L(id: ScoreComponent['id'], locale: Locale): string {
  return LABELS[id][locale];
}

interface ScoreInput {
  connections: Connection[];
  reportCount?: number;
  locale?: Locale;
}

export function computeTrust({
  connections,
  reportCount = 0,
  locale = 'de',
}: ScoreInput): TrustScore {
  const visible = connections.filter((c) => !c.hidden && c.verified_at);
  const allConnections = connections.filter((c) => c.verified_at);

  const identity = computeIdentity(visible, locale);
  const marketplace = computeMarketplace(visible, locale);
  const volume = computeVolume(visible, locale);
  const longevity = computeLongevity(visible, locale);
  const activity = computeActivity(visible, locale);
  const penalty = computePenalty(allConnections, visible.length, reportCount, locale);

  const totalEarned =
    identity.earned +
    marketplace.earned +
    volume.earned +
    longevity.earned +
    activity.earned +
    penalty.earned;

  const realMp = visible.filter(
    (c) =>
      MARKETPLACE_PLATFORMS.includes(c.platform as (typeof MARKETPLACE_PLATFORMS)[number]) &&
      c.platform !== 'paypal',
  );
  const totalPos = realMp.reduce((s, c) => s + (c.positive_count ?? 0), 0);
  const totalNeg = realMp.reduce((s, c) => s + (c.negative_count ?? 0), 0);
  const totalRatedSum = totalPos + totalNeg;
  const aggregatePositivePct = totalRatedSum >= 10 ? (totalPos / totalRatedSum) * 100 : null;
  const totalRatings = realMp.reduce((s, c) => s + (c.rating_count ?? 0), 0);

  let total = Math.max(0, Math.min(100, Math.round(totalEarned)));
  let qualityCapped = false;
  let tierInfo = tierFor(total, locale);

  if (aggregatePositivePct != null && aggregatePositivePct < 70) {
    if (total > 49) {
      total = 49;
      qualityCapped = true;
    }
    tierInfo = tierFor(total, locale);
  }

  const suggestions = buildSuggestions({ visible, identity, marketplace, longevity }, locale);

  return {
    total,
    tier: tierInfo.tier,
    tierLabel: tierInfo.tierLabel,
    components: [identity, marketplace, volume, longevity, activity, penalty],
    suggestions,
    aggregatePositivePct,
    totalRatings,
    qualityCapped,
  };
}

function computeIdentity(visible: Connection[], locale: Locale): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;

  const kyc = visible.find((c) => KYC_PLATFORMS.includes(c.platform as 'paypal' | 'linkedin'));
  if (kyc) {
    earned += 20;
    const platformLabel = kyc.platform === 'paypal' ? 'PayPal' : 'LinkedIn';
    detail.push(
      locale === 'en'
        ? `+20 KYC verification (${platformLabel})`
        : `+20 KYC-Verifikation (${platformLabel})`,
    );
    if (kyc.verified_name && kyc.show_name) {
      earned += 5;
      detail.push(locale === 'en' ? '+5 Real name public' : '+5 Klarname öffentlich');
    }
    if (kyc.verified_picture_url && kyc.show_picture) {
      earned += 5;
      detail.push(locale === 'en' ? '+5 Profile picture verified' : '+5 Profilbild verifiziert');
    }
  } else {
    detail.push(
      locale === 'en'
        ? 'No KYC platform connected (PayPal / LinkedIn)'
        : 'Keine KYC-Plattform verbunden (PayPal / LinkedIn)',
    );
  }

  return { id: 'identity', label: L('identity', locale), earned, max: 30, detail };
}

function computeMarketplace(visible: Connection[], locale: Locale): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;

  const marketplaces = visible.filter((c) =>
    MARKETPLACE_PLATFORMS.includes(c.platform as (typeof MARKETPLACE_PLATFORMS)[number]),
  );
  const realMarketplaces = marketplaces.filter((c) => c.platform !== 'paypal');
  const platformNames = realMarketplaces.map(nameFor).join(' · ');

  let base = 0;
  if (realMarketplaces.length >= 4) {
    base = 30;
    detail.push(
      locale === 'en'
        ? `+30 ${realMarketplaces.length} marketplaces: ${platformNames}`
        : `+30 ${realMarketplaces.length} Marktplätze: ${platformNames}`,
    );
  } else if (realMarketplaces.length >= 2) {
    base = 20;
    detail.push(
      locale === 'en'
        ? `+20 ${realMarketplaces.length} marketplaces: ${platformNames}`
        : `+20 ${realMarketplaces.length} Marktplätze: ${platformNames}`,
    );
  } else if (realMarketplaces.length === 1) {
    base = 10;
    detail.push(
      locale === 'en'
        ? `+10 1 marketplace: ${platformNames}`
        : `+10 1 Marktplatz: ${platformNames}`,
    );
  } else {
    detail.push(
      locale === 'en' ? 'No marketplace verification' : 'Keine Marktplatz-Verifikation',
    );
  }
  earned = base;

  const totalPos = realMarketplaces.reduce((s, c) => s + (c.positive_count ?? 0), 0);
  const totalNeg = realMarketplaces.reduce((s, c) => s + (c.negative_count ?? 0), 0);
  const totalRated = totalPos + totalNeg;

  if (totalRated >= 10) {
    const pct = (totalPos / totalRated) * 100;
    const pctFmt = formatPercent(pct, locale);
    const positive = locale === 'en' ? 'positive' : 'positiv';
    const ratingsLabel = locale === 'en' ? 'ratings' : 'Bewertungen';
    if (pct >= 95) {
      earned += 10;
      detail.push(
        locale === 'en'
          ? `+10 Rate: ${pctFmt} ${positive} (${totalRated} ${ratingsLabel})`
          : `+10 Quote: ${pctFmt} ${positive} (${totalRated} ${ratingsLabel})`,
      );
    } else if (pct >= 90) {
      earned += 5;
      detail.push(
        locale === 'en'
          ? `+5 Rate: ${pctFmt} ${positive} (${totalRated} ${ratingsLabel})`
          : `+5 Quote: ${pctFmt} ${positive} (${totalRated} ${ratingsLabel})`,
      );
    } else if (pct >= 80) {
      detail.push(
        locale === 'en'
          ? `+0 Rate: ${pctFmt} ${positive} — no bonus, no penalty`
          : `+0 Quote: ${pctFmt} ${positive} — kein Bonus, keine Strafe`,
      );
    } else if (pct >= 50) {
      const pen = Math.min(20, base);
      earned -= pen;
      detail.push(
        locale === 'en'
          ? `-${pen} Penalty: only ${pctFmt} ${positive} (<80%)`
          : `-${pen} Strafe: nur ${pctFmt} ${positive} (<80 %)`,
      );
    } else {
      earned = 0;
      detail.push(
        locale === 'en'
          ? `-${base} Heavy penalty: ${pctFmt} ${positive} (<50%) — marketplace reputation not trustworthy`
          : `-${base} schwere Strafe: ${pctFmt} ${positive} (<50 %) — Marktplatz-Reputation nicht vertrauenswürdig`,
      );
    }
  }

  return { id: 'marketplace', label: L('marketplace', locale), earned, max: 40, detail };
}

function computeVolume(visible: Connection[], locale: Locale): ScoreComponent {
  const total = visible.reduce((sum, c) => sum + (c.rating_count ?? 0), 0);
  const detail: string[] = [];
  let earned = 0;
  const ratingsLabel = locale === 'en' ? 'ratings' : 'Bewertungen';

  if (total >= 100) {
    earned = 15;
    detail.push(`+15 ${formatNumber(total, locale)} ${ratingsLabel}`);
  } else if (total >= 10) {
    earned = 10;
    detail.push(`+10 ${total} ${ratingsLabel}`);
  } else if (total >= 1) {
    earned = 5;
    detail.push(`+5 ${total} ${ratingsLabel}`);
  } else {
    detail.push(locale === 'en' ? 'No ratings yet' : 'Noch keine Bewertungen');
  }

  const breakdown = visible
    .filter((c) => (c.rating_count ?? 0) > 0)
    .map((c) => `${nameFor(c)}: ${c.rating_count}`);
  if (breakdown.length > 0) {
    detail.push(
      (locale === 'en' ? 'Breakdown: ' : 'Aufteilung: ') + breakdown.join(' · '),
    );
  }

  return { id: 'volume', label: L('volume', locale), earned, max: 15, detail };
}

function computeLongevity(visible: Connection[], locale: Locale): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;
  let oldestMs = Infinity;

  for (const c of visible) {
    if (!c.member_since) continue;
    const t = new Date(c.member_since).getTime();
    if (!Number.isNaN(t) && t < oldestMs) oldestMs = t;
  }

  if (oldestMs === Infinity) {
    detail.push(
      locale === 'en' ? 'No membership data available' : 'Keine Mitgliedschafts-Daten verfügbar',
    );
    return { id: 'longevity', label: L('longevity', locale), earned, max: 10, detail };
  }

  const ageYears = (Date.now() - oldestMs) / (1000 * 60 * 60 * 24 * 365);
  const oldestYear = new Date(oldestMs).getFullYear();
  const activeSince = locale === 'en' ? 'active since' : 'aktiv seit';

  if (ageYears >= 5) {
    earned = 10;
    detail.push(`+10 ${activeSince} ${oldestYear}`);
  } else if (ageYears >= 2) {
    earned = 5;
    detail.push(`+5 ${activeSince} ${oldestYear}`);
  } else if (ageYears >= 1) {
    earned = 2;
    detail.push(`+2 ${activeSince} ${oldestYear}`);
  } else {
    detail.push(
      locale === 'en'
        ? `Account since ${oldestYear} (< 1 year)`
        : `Account seit ${oldestYear} (< 1 Jahr)`,
    );
  }

  return { id: 'longevity', label: L('longevity', locale), earned, max: 10, detail };
}

function computeActivity(visible: Connection[], locale: Locale): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;
  if (visible.length === 0) {
    detail.push(locale === 'en' ? 'No active connections' : 'Keine aktiven Verbindungen');
    return { id: 'activity', label: L('activity', locale), earned, max: 5, detail };
  }

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const allFresh = visible.every((c) => {
    if (!c.last_fetched) return false;
    return now - new Date(c.last_fetched).getTime() < sevenDays;
  });

  if (allFresh) {
    earned = 5;
    detail.push(
      locale === 'en'
        ? '+5 all connections fresh (≤ 7 days)'
        : '+5 alle Verbindungen frisch (≤ 7 Tage)',
    );
  } else {
    detail.push(
      locale === 'en'
        ? 'Some connections stale (click Refresh)'
        : 'Manche Verbindungen veraltet (Aktualisieren klicken)',
    );
  }
  return { id: 'activity', label: L('activity', locale), earned, max: 5, detail };
}

function computePenalty(
  allConnections: Connection[],
  visibleCount: number,
  reportCount: number,
  locale: Locale,
): ScoreComponent {
  const detail: string[] = [];
  let earned = 0;

  if (reportCount > 0) {
    earned -= 10;
    detail.push(
      locale === 'en'
        ? `-10 ${reportCount} confirmed report${reportCount > 1 ? 's' : ''}`
        : `-10 ${reportCount} bestätigte Meldung${reportCount > 1 ? 'en' : ''}`,
    );
  }

  const failed = allConnections.filter((c) => c.last_error).length;
  if (failed > 0) {
    earned -= 5;
    detail.push(
      locale === 'en'
        ? `-5 ${failed} connection${failed > 1 ? 's' : ''} with error`
        : `-5 ${failed} Verbindung${failed > 1 ? 'en' : ''} mit Fehler`,
    );
  }

  const totalVerified = allConnections.length;
  const hiddenCount = totalVerified - visibleCount;
  if (totalVerified >= 4 && hiddenCount / totalVerified > 0.5) {
    earned -= 10;
    detail.push(
      locale === 'en'
        ? `-10 ${hiddenCount} of ${totalVerified} connections hidden`
        : `-10 ${hiddenCount} von ${totalVerified} Verbindungen versteckt`,
    );
  }

  if (earned === 0) detail.push(locale === 'en' ? 'No penalty points' : 'Keine Strafpunkte');

  return { id: 'penalty', label: L('penalty', locale), earned, max: 0, detail };
}

function buildSuggestions(
  {
    visible,
    identity,
    marketplace,
    longevity,
  }: {
    visible: Connection[];
    identity: ScoreComponent;
    marketplace: ScoreComponent;
    longevity: ScoreComponent;
  },
  locale: Locale,
): { delta: number; text: string }[] {
  const out: { delta: number; text: string }[] = [];

  const hasKyc = visible.some((c) =>
    KYC_PLATFORMS.includes(c.platform as 'paypal' | 'linkedin'),
  );
  if (!hasKyc) {
    out.push({
      delta: 20,
      text: locale === 'en' ? 'Connect PayPal or LinkedIn' : 'PayPal oder LinkedIn verknüpfen',
    });
  } else if (identity.earned < identity.max) {
    const kyc = visible.find((c) =>
      KYC_PLATFORMS.includes(c.platform as 'paypal' | 'linkedin'),
    );
    if (kyc?.verified_name && !kyc.show_name) {
      out.push({
        delta: 5,
        text: locale === 'en' ? 'Show real name publicly' : 'Klarnamen öffentlich anzeigen',
      });
    }
    if (kyc?.verified_picture_url && !kyc.show_picture) {
      out.push({
        delta: 5,
        text:
          locale === 'en'
            ? 'Show profile picture publicly'
            : 'Profilbild öffentlich anzeigen',
      });
    }
  }

  const realMp = visible.filter(
    (c) =>
      MARKETPLACE_PLATFORMS.includes(c.platform as (typeof MARKETPLACE_PLATFORMS)[number]) &&
      c.platform !== 'paypal',
  );
  if (realMp.length === 0) {
    out.push({
      delta: 10,
      text:
        locale === 'en'
          ? 'Connect at least 1 marketplace'
          : 'Mindestens 1 Marktplatz verknüpfen',
    });
  } else if (realMp.length === 1) {
    out.push({
      delta: 10,
      text: locale === 'en' ? 'Connect a second marketplace' : 'Zweiten Marktplatz verknüpfen',
    });
  } else if (realMp.length < 4) {
    out.push({
      delta: 10,
      text: locale === 'en' ? 'Expand to 4 marketplaces' : 'Auf 4 Marktplätze ausbauen',
    });
  }

  if (longevity.earned < longevity.max) {
    out.push({
      delta: 10 - longevity.earned,
      text:
        locale === 'en'
          ? 'Longevity grows automatically over time'
          : 'Langlebigkeit wächst automatisch über die Zeit',
    });
  }

  return out.slice(0, 3);
}
