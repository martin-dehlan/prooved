import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, FileText, Mail, ScanLine, Award, Code2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { HeaderMenu } from '@/shared/components/ui/HeaderMenu';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

const REPO_URL = 'https://github.com/martin-dehlan/prooved';
const HARDENIZE_URL = 'https://www.hardenize.com/report/prooved.xyz';
const SCORECARD_URL = 'https://scorecard.dev/viewer/?uri=github.com/martin-dehlan/prooved';
const SECURITY_TXT = 'https://prooved.xyz/.well-known/security.txt';
const SECURITY_MD = 'https://github.com/martin-dehlan/prooved/blob/main/SECURITY.md';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SecurityPage' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

type RowProps = {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: string;
};

function Row({ href, external, icon, title, text, cta }: RowProps) {
  const inner = (
    <>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-accent">{icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-text">{title}</p>
          <p className="mt-1 text-sm text-muted">{text}</p>
        </div>
      </div>
      <span className="mt-3 inline-block text-xs font-semibold text-accent">{cta} →</span>
    </>
  );
  const className =
    'block rounded-xl border border-elevated bg-surface px-4 py-4 transition hover:border-text/40';
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <a href={href} className={className}>
      {inner}
    </a>
  );
}

export default async function SecurityPage() {
  const t = await getTranslations('SecurityPage');
  const tCommon = await getTranslations('Common');

  return (
    <main className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 py-6">
        <Link href="/" aria-label={tCommon('home')}>
          <Logo size={28} />
        </Link>
        <HeaderMenu />
      </header>

      <section className="mx-auto max-w-md px-5 pb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text">{t('h1')}</h1>
        <p className="mt-3 text-base text-muted">{t('intro')}</p>

        <div className="mt-8 space-y-3">
          <Row
            href={HARDENIZE_URL}
            external
            icon={<ScanLine size={18} aria-hidden />}
            title={t('hardenizeTitle')}
            text={t('hardenizeText')}
            cta={t('hardenizeCta')}
          />
          <Row
            href={SCORECARD_URL}
            external
            icon={<Award size={18} aria-hidden />}
            title={t('scorecardTitle')}
            text={t('scorecardText')}
            cta={t('scorecardCta')}
          />
          <Row
            href={REPO_URL}
            external
            icon={<Code2 size={18} aria-hidden />}
            title={t('repoTitle')}
            text={t('repoText')}
            cta={t('repoCta')}
          />
          <Row
            href={SECURITY_MD}
            external
            icon={<FileText size={18} aria-hidden />}
            title={t('policyTitle')}
            text={t('policyText')}
            cta={t('policyCta')}
          />
          <Row
            href={SECURITY_TXT}
            external
            icon={<ShieldCheck size={18} aria-hidden />}
            title={t('securityTxtTitle')}
            text={t('securityTxtText')}
            cta={t('securityTxtCta')}
          />
          <Row
            href="mailto:security@prooved.xyz"
            external
            icon={<Mail size={18} aria-hidden />}
            title={t('contactTitle')}
            text={t('contactText')}
            cta={t('contactCta')}
          />
        </div>
      </section>

      <LegalFooter />
    </main>
  );
}
