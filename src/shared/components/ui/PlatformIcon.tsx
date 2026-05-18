// Platform-Icon component — renders official brand SVGs from simple-icons
// for known brands; custom inline SVGs for niche platforms (Willhaben, Shpock,
// LinkedIn) and conceptual platforms (Website, Custom).
//
// Usage: <PlatformIcon platform="ebay" size={20} />
//        <PlatformIcon platform="custom" size={28} className="text-text" />

import {
  siEbay,
  siPaypal,
  siEtsy,
  siVinted,
  siDiscogs,
  siGithub,
  siKleinanzeigen,
} from 'simple-icons';

interface SimpleIcon {
  svg: string;
}

const BRAND_ICONS: Record<string, SimpleIcon> = {
  ebay: siEbay,
  paypal: siPaypal,
  etsy: siEtsy,
  vinted: siVinted,
  discogs: siDiscogs,
  github: siGithub,
  kleinanzeigen: siKleinanzeigen,
};

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

/** Render simple-icons SVG with currentColor fill, scaled to size. */
function BrandSvg({ icon, size, className }: { icon: SimpleIcon; size: number; className?: string }) {
  // Inject fill="currentColor" + size, strip <title> for a11y noise
  const svg = icon.svg
    .replace('<svg ', `<svg fill="currentColor" width="${size}" height="${size}" `)
    .replace(/<title>[\s\S]*?<\/title>/, '');
  return (
    <span
      aria-hidden
      className={className}
      style={{ display: 'inline-flex', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function PlatformIcon({ platform, size = 20, className }: PlatformIconProps) {
  const brand = BRAND_ICONS[platform];
  if (brand) return <BrandSvg icon={brand} size={size} className={className} />;

  // LinkedIn (not in simple-icons due to trademark)
  if (platform === 'linkedin') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={className}
      >
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.339 18.337V9.751H5.667v8.586h2.672zM7.003 8.587a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.336 9.75v-4.703c0-2.55-1.379-3.736-3.218-3.736-1.484 0-2.149.816-2.519 1.388V9.751h-2.671c.035.755 0 8.586 0 8.586h2.671v-4.795c0-.241.018-.481.089-.653.193-.481.633-.978 1.371-.978.967 0 1.354.737 1.354 1.819v4.607h2.923z" />
      </svg>
    );
  }

  // Facebook — official "f" mark (simplified for trademark safety)
  if (platform === 'facebook') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={className}
      >
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
      </svg>
    );
  }

  // Willhaben — green W
  if (platform === 'willhaben') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={className}
      >
        <rect width="24" height="24" rx="4" fill="currentColor" opacity="0.15" />
        <path
          d="M5 7l2 9 3-7 3 7 2-9"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  // Shpock — yellow circle "S"
  if (platform === 'shpock') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={className}
      >
        <circle cx="12" cy="12" r="10" opacity="0.15" />
        <path
          d="M9 8c0-1 1-2 3-2s3 1 3 2-2 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }

  // Website — globe
  if (platform === 'website') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={className}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
      </svg>
    );
  }

  // Reverb — stylized "R" with sound wave
  if (platform === 'reverb') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
        className={className}
      >
        <path d="M6 5v14M6 5h6a4 4 0 0 1 0 8h-6M11 13l5 6" />
        <path d="M19 9c1 1 1 5 0 6" strokeOpacity="0.5" />
      </svg>
    );
  }

  // Custom — sparkle
  if (platform === 'custom') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={className}
      >
        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
      </svg>
    );
  }

  // Fallback — first letter capitalized
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.55,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {platform[0]?.toUpperCase()}
    </span>
  );
}
