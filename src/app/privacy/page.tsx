import Link from 'next/link';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

export const metadata = { title: 'Datenschutzerklärung — Prooved' };

const EFFECTIVE_DATE = '09.05.2026';

export default function PrivacyPage() {
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
          Datenschutzerklärung
        </h1>
        <p className="mt-1 text-sm text-muted">Stand: {EFFECTIVE_DATE}</p>

        <Section n="1" title="Verantwortlicher">
          <p>
            Martin Dehlan, Am Breiten Luch 46, 13053 Berlin, Deutschland.
            E-Mail:{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
          </p>
        </Section>

        <Section n="2" title="Welche Daten wir verarbeiten">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Account-Daten:</strong> E-Mail-Adresse, Slug, optionaler
              Name. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung).
            </li>
            <li>
              <strong>Plattform-Verbindungen:</strong> Plattform-User-ID,
              Profil-URL, Verifizierungs-Tokens (verschlüsselt mit AES-256),
              gecachte öffentliche Bewertungs-Statistiken (Score, Anzahl).
            </li>
            <li>
              <strong>Wallet-Daten (optional):</strong> Solana-Public-Key,
              kryptographische Signatur. Nur wenn du Wallet-Funktionen nutzt.
            </li>
            <li>
              <strong>Reports:</strong> IP-Adresse, Zeitstempel, Begründung. Zur
              Spam- und Missbrauchsabwehr (Art. 6 Abs. 1 lit. f DSGVO).
            </li>
            <li>
              <strong>Server-Logs:</strong> IP-Adresse, User-Agent, Zeitstempel
              durch unseren Hoster (Vercel). Aufbewahrung max. 30 Tage.
            </li>
          </ul>
        </Section>

        <Section n="3" title="Auftragsverarbeiter und externe Dienste">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Vercel Inc.</strong> (USA) — Hosting, CDN, Logs.
              Standardvertragsklauseln (SCC) und EU-US Data Privacy Framework.
            </li>
            <li>
              <strong>Supabase Inc.</strong> (USA, EU-Region möglich) —
              Datenbank, Authentifizierung, Edge Functions.
            </li>
            <li>
              <strong>Resend</strong> — Versand von Magic-Link- und
              System-E-Mails.
            </li>
            <li>
              <strong>Drittplattform-APIs</strong> (eBay, PayPal, Vinted,
              Kleinanzeigen, Discogs): Übermittlung erfolgt nur auf deine
              Veranlassung im Rahmen der Verifizierung. Es gelten die
              Datenschutzbestimmungen der jeweiligen Plattform.
            </li>
          </ul>
        </Section>

        <Section n="4" title="OAuth und Bio-Code">
          <p>
            Bei OAuth-Verfahren (eBay, PayPal) werden Access-Tokens AES-256
            verschlüsselt gespeichert. Wir greifen ausschließlich auf
            öffentliche Bewertungs-Endpunkte zu — keine Transaktionsdaten,
            keine Käufe, keine Nachrichten.
          </p>
          <p>
            Bei Bio-Code-Verfahren (Vinted, Kleinanzeigen) prüft unser Server
            einmalig deinen öffentlichen Profiltext und löscht den Code danach.
            Es werden keine Login-Daten der Plattformen gespeichert.
          </p>
        </Section>

        <Section n="5" title="Cookies">
          <p>
            Wir verwenden technisch notwendige Cookies für die Authentifizierung
            (Supabase Session) und ein lokales Theme-Setting (Dark/Light).
            Tracking- oder Werbe-Cookies setzen wir nicht ein.
          </p>
        </Section>

        <Section n="6" title="Öffentliches Profil">
          <p>
            Dein Slug, dein Name (falls angegeben) und verifizierte Plattform-
            Statistiken sind öffentlich unter <code>/{'{slug}'}</code> abrufbar.
            Indexierung durch Suchmaschinen ist möglich. Du kannst das Profil
            jederzeit löschen.
          </p>
        </Section>

        <Section n="7" title="Speicherdauer">
          <ul className="list-inside list-disc space-y-1">
            <li>Account-Daten: bis zur Löschung deines Accounts</li>
            <li>Verbindungen: bis zur Trennung oder Account-Löschung</li>
            <li>Server-Logs: max. 30 Tage</li>
            <li>Reports: 12 Monate (zur Missbrauchsabwehr)</li>
          </ul>
        </Section>

        <Section n="8" title="Deine Rechte">
          <p>
            Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16),
            Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit
            (Art. 20) und Widerspruch (Art. 21 DSGVO). Beschwerderecht bei der
            zuständigen Aufsichtsbehörde:{' '}
            <a
              href="https://www.datenschutz-berlin.de"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              Berliner Beauftragte für Datenschutz
            </a>
            .
          </p>
          <p>
            Deinen Account kannst du jederzeit selbst unter{' '}
            <Link
              href="/dashboard/settings"
              className="text-accent hover:underline"
            >
              Einstellungen
            </Link>{' '}
            löschen. Für Datenexport oder andere Anfragen schreib uns an{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
            .
          </p>
        </Section>

        <Section n="9" title="On-Chain-Daten (Solana)">
          <p>
            Falls du Soulbound-Tokens (SBTs) mintest, werden diese auf der
            Solana-Blockchain unwiderruflich öffentlich gespeichert. Eine
            Löschung durch uns ist technisch nicht möglich. Diese Funktion ist
            optional und erfordert deine ausdrückliche Zustimmung.
          </p>
        </Section>

        <Section n="10" title="Änderungen">
          <p>
            Diese Erklärung kann angepasst werden. Die jeweils aktuelle Version
            findest du unter dieser URL.
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
