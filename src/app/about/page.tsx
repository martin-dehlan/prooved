import Link from 'next/link';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

export const metadata = {
  title: 'Über Prooved — Reputation. Plattformübergreifend.',
  description:
    'Prooved bündelt deine Bewertungen von eBay, PayPal, Vinted und Kleinanzeigen in einem verifizierten Profil.',
};

export default function AboutPage() {
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

      <main className="mx-auto max-w-2xl space-y-8 px-5 py-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Über Prooved
          </h1>
          <p className="mt-3 text-base text-muted">
            Eine Reputation. Ein Link. Plattformübergreifend.
          </p>
        </div>

        <Section title="Was Prooved ist">
          <p>
            Prooved bündelt deine Bewertungen von Marktplätzen wie eBay, PayPal,
            Vinted und Kleinanzeigen in einem einzigen, teilbaren Profil. Statt
            Screenshots oder „glaub mir doch" bekommst du einen verifizierten
            Link, den du in Inseraten oder DMs teilst.
          </p>
        </Section>

        <Section title="Was Prooved nicht ist">
          <p>
            Prooved erstellt <strong>keine eigenen Bewertungen</strong>. Wir
            verifizieren nur, dass ein Account wirklich der angegebenen Person
            gehört, und zeigen die offiziellen Statistiken der Plattform an.
            Quelle und Verifizierungsdatum stehen transparent unter jeder Karte.
          </p>
        </Section>

        <Section title="Wie wir verifizieren">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Gold</strong> — offizielle OAuth-Integration (eBay,
              PayPal). Höchstes Vertrauen.
            </li>
            <li>
              <strong>Silver</strong> — Bio-Code-Verfahren: ein Code in deinem
              Plattform-Profil beweist Eigentum (Vinted, Kleinanzeigen).
            </li>
            <li>
              <strong>Bronze</strong> — öffentlicher Profil-Snapshot.
            </li>
          </ul>
        </Section>

        <Section title="Datenschutz">
          <p>
            Wir speichern nur, was nötig ist: E-Mail, Slug, verschlüsselte
            Plattform-Tokens, gecachte Bewertungs-Statistiken. Du kannst
            jederzeit deine Daten exportieren oder den Account löschen. Details
            in der{' '}
            <Link href="/privacy" className="text-accent hover:underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </Section>

        <Section title="Kontakt">
          <p>
            Fragen, Feedback, Bug-Reports:{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
          </p>
        </Section>

        <div className="pt-4">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-text px-6 text-sm font-semibold text-bg hover:opacity-90"
          >
            Jetzt loslegen
          </Link>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}
