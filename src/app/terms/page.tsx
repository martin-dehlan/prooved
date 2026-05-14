import Link from 'next/link';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

export const metadata = { title: 'Nutzungsbedingungen — Prooved' };

const EFFECTIVE_DATE = '09.05.2026';

export default function TermsPage() {
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
          Nutzungsbedingungen
        </h1>
        <p className="mt-1 text-sm text-muted">
          Stand: {EFFECTIVE_DATE}
        </p>

        <Section n="1" title="Geltungsbereich">
          <p>
            Diese Nutzungsbedingungen regeln die Nutzung des Dienstes „Prooved"
            (nachfolgend „Dienst"), bereitgestellt von Martin Dehlan, Am Breiten
            Luch 46, 13053 Berlin (nachfolgend „Anbieter"). Mit der Registrierung
            erklärst du dich mit diesen Bedingungen einverstanden.
          </p>
        </Section>

        <Section n="2" title="Beschreibung des Dienstes">
          <p>
            Prooved ermöglicht es Nutzern, Bewertungen und Reputationsdaten von
            Drittplattformen (z.&nbsp;B. eBay, PayPal, Vinted, Kleinanzeigen)
            über offizielle APIs oder Bio-Code-Verfahren zu verifizieren und in
            einem öffentlichen Profil zu bündeln.
          </p>
          <p>
            Der Anbieter erstellt keine eigenen Bewertungen. Angezeigte Werte
            stammen ausschließlich von der jeweiligen Drittplattform.
          </p>
        </Section>

        <Section n="3" title="Registrierung und Account">
          <p>
            Die Nutzung erfordert eine Registrierung mit gültiger E-Mail-Adresse.
            Du bist für die Geheimhaltung deiner Zugangsdaten verantwortlich. Pro
            Person ist nur ein Account zulässig.
          </p>
          <p>
            Du sicherst zu, dass alle verknüpften Plattform-Accounts
            tatsächlich dir gehören. Die Verknüpfung fremder Accounts ist
            untersagt.
          </p>
        </Section>

        <Section n="4" title="Pflichten der Nutzer">
          <p>Du verpflichtest dich, den Dienst nicht zu nutzen, um:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>fremde Accounts oder Bewertungen vorzutäuschen,</li>
            <li>
              die technischen Schutzmaßnahmen oder Rate-Limits zu umgehen,
            </li>
            <li>
              Bio-Codes oder Verifikations-Tokens an Dritte weiterzugeben,
            </li>
            <li>automatisierte Massenabfragen (Scraping) durchzuführen,</li>
            <li>
              gegen die Nutzungsbedingungen der angebundenen Drittplattformen zu
              verstoßen.
            </li>
          </ul>
        </Section>

        <Section n="5" title="Drittplattformen">
          <p>
            Der Anbieter steht in keiner offiziellen Geschäftsbeziehung zu eBay,
            PayPal, Vinted, Kleinanzeigen, Discogs oder anderen genannten
            Plattformen, sofern nicht ausdrücklich angegeben. Verfügbarkeit und
            Funktion einzelner Integrationen können sich ändern, wenn die
            Drittplattformen ihre APIs oder Richtlinien anpassen.
          </p>
        </Section>

        <Section n="6" title="Verfügbarkeit">
          <p>
            Der Anbieter bemüht sich um hohe Verfügbarkeit, schuldet aber keine
            ununterbrochene Erreichbarkeit. Wartungsarbeiten, Ausfälle bei
            Drittplattformen oder höhere Gewalt können zu Einschränkungen
            führen.
          </p>
        </Section>

        <Section n="7" title="Haftung">
          <p>
            Der Anbieter haftet unbeschränkt bei Vorsatz und grober
            Fahrlässigkeit sowie bei Schäden aus Verletzung des Lebens, des
            Körpers oder der Gesundheit. Bei einfacher Fahrlässigkeit haftet der
            Anbieter nur bei Verletzung wesentlicher Vertragspflichten und
            begrenzt auf den vorhersehbaren, vertragstypischen Schaden.
          </p>
          <p>
            Für die Richtigkeit der von Drittplattformen gelieferten Daten wird
            keine Haftung übernommen.
          </p>
        </Section>

        <Section n="8" title="Kündigung und Löschung">
          <p>
            Du kannst deinen Account jederzeit unter{' '}
            <Link
              href="/dashboard/settings"
              className="text-accent hover:underline"
            >
              Einstellungen
            </Link>{' '}
            löschen. Der Anbieter kann Accounts bei Verstößen gegen diese
            Bedingungen sperren oder löschen.
          </p>
        </Section>

        <Section n="9" title="Änderungen">
          <p>
            Der Anbieter behält sich vor, diese Bedingungen anzupassen. Über
            wesentliche Änderungen wirst du per E-Mail informiert.
            Widerspruchsrecht: 30 Tage; nach Fristablauf gelten die geänderten
            Bedingungen als akzeptiert.
          </p>
        </Section>

        <Section n="10" title="Schlussbestimmungen">
          <p>
            Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam
            sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </Section>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-text">
        {n}. {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}
