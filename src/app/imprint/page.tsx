import Link from 'next/link';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

export const metadata = { title: 'Impressum — Prooved' };

export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-elevated bg-surface/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label="Startseite">
            <Logo size={28} />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted hover:text-text"
          >
            ← Zurück
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Impressum
        </h1>
        <p className="mt-1 text-sm text-muted">
          Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
        </p>

        <Section title="Anbieter">
          <p>Martin Dehlan</p>
          <p>Am Breiten Luch 46</p>
          <p>13053 Berlin</p>
          <p>Deutschland</p>
        </Section>

        <Section title="Kontakt">
          <p>
            E-Mail:{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
          </p>
        </Section>

        <Section title="Umsatzsteuer">
          <p>
            Gemäß § 19 UStG wird keine Umsatzsteuer erhoben (Kleinunternehmer).
          </p>
        </Section>

        <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
          <p>Martin Dehlan</p>
          <p>Am Breiten Luch 46, 13053 Berlin</p>
        </Section>

        <Section title="EU-Streitschlichtung">
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </Section>

        <Section title="Haftung für Inhalte">
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen.
          </p>
        </Section>

        <Section title="Haftung für Links">
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter (eBay,
            PayPal, Vinted, Kleinanzeigen u.a.), auf deren Inhalte wir keinen
            Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der
            jeweilige Anbieter oder Betreiber verantwortlich.
          </p>
        </Section>

        <Section title="Marken- und Urheberrecht">
          <p>
            Genannte Marken und Logos (eBay, PayPal, Vinted, Kleinanzeigen,
            Discogs etc.) sind Eigentum ihrer jeweiligen Inhaber. Prooved steht
            in keiner geschäftlichen Verbindung zu diesen Plattformen, sofern
            nicht ausdrücklich angegeben.
          </p>
        </Section>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <div className="mt-2 space-y-1 text-sm text-muted">{children}</div>
    </section>
  );
}
