import { getTranslations } from 'next-intl/server';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const REPO_URL = 'https://github.com/martin-dehlan/prooved';

function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export async function TrustSection() {
  const t = await getTranslations('Trust');

  return (
    <section className="mx-auto max-w-md space-y-4 px-5 pb-10">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-xl border border-elevated bg-surface px-4 py-3 text-sm text-text transition hover:border-text/40"
      >
        <span className="flex items-center gap-2">
          <GithubMark size={16} />
          <span className="font-semibold">{t('openSource')}</span>
          <span className="text-muted">· MIT</span>
        </span>
        <span className="text-xs text-muted">github.com</span>
      </a>

      <div className="rounded-xl border border-elevated bg-surface px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-semibold text-text">
          <Eye size={16} aria-hidden />
          {t('readOnlyTitle')}
        </p>
        <p className="mt-1 text-muted">{t('readOnlyText')}</p>
      </div>

      <div className="rounded-xl border border-elevated bg-surface px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-semibold text-text">
          <EyeOff size={16} aria-hidden />
          {t('notTitle')}
        </p>
        <ul className="mt-2 space-y-1 text-muted">
          <li>· {t('notTracking')}</li>
          <li>· {t('notAds')}</li>
          <li>· {t('notSelling')}</li>
          <li>· {t('notPasswords')}</li>
          <li>· {t('euHosted')}</li>
          <li>· {t('oneClickDelete')}</li>
        </ul>
      </div>

      <Link
        href="/security"
        className="flex items-center justify-between rounded-xl border border-elevated bg-surface px-4 py-3 text-sm text-text transition hover:border-text/40"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} aria-hidden />
          <span className="font-semibold">{t('securityTitle')}</span>
        </span>
        <span className="text-xs text-muted">{t('securityCta')}</span>
      </Link>
    </section>
  );
}
