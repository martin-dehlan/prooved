import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

export function Hero() {
  return (
    <>
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-5 py-10">
      <header className="flex items-center justify-between">
        <Logo size={28} />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/register"
            className="text-sm font-medium text-muted hover:text-text"
          >
            Anmelden
          </Link>
        </div>
      </header>

      <div className="flex flex-col items-center text-center">
        <Image
          src="/logo.png"
          alt=""
          width={88}
          height={88}
          priority
          className="mb-4"
        />
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          Beta
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Eine Reputation. <br />
          Ein Link.
        </h1>
        <p className="mt-5 text-base text-muted sm:text-lg">
          Bündele deine Bewertungen von eBay, PayPal, Vinted und Kleinanzeigen
          in einem verifizierten Profil.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-xl bg-text px-6 text-base font-semibold text-bg transition hover:opacity-90 active:scale-[0.98]"
        >
          Jetzt loslegen
        </Link>
        <p className="mt-3 text-xs text-muted">
          Kostenlos · Kein Passwort · 30 Sek
        </p>
      </div>

      <footer className="space-y-3 text-center">
        <ol className="space-y-2 text-left text-sm text-text">
          <li className="flex gap-3">
            <span className="font-bold text-text">1.</span>
            <span>Mit Magic Link anmelden</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-text">2.</span>
            <span>Plattformen verknüpfen (OAuth oder Bio-Code)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-text">3.</span>
            <span>Profil-Link teilen — statt Screenshots</span>
          </li>
        </ol>
        <p className="text-xs text-muted">
          Wir erstellen keine eigenen Bewertungen. Wir verifizieren nur, dass
          ein Account dir gehört.
        </p>
      </footer>
    </section>
    <LegalFooter />
    </>
  );
}
