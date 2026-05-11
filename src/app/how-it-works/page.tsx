import Link from 'next/link';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { Logo } from '@/shared/components/ui/Logo';

export const metadata = {
  title: 'Wie Prooved funktioniert',
  description:
    'Was Prooved verifiziert, was wir nicht garantieren — transparent erklärt.',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-6">
        <Link href="/" aria-label="Startseite">
          <Logo size={28} />
        </Link>
        <ThemeToggle />
      </header>

      <article className="mx-auto max-w-2xl space-y-8 px-5 pb-16">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Wie Prooved funktioniert
          </h1>
          <p className="text-base text-muted">
            Wir aggregieren deine echte Reputation von eBay, PayPal, Vinted &
            anderen Plattformen in einem teilbaren Profil. Transparent, ohne
            Black-Box-Score, ohne erfundene Bewertungen.
          </p>
        </section>

        <Section title="Was wir prüfen">
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>
              <strong>Eigentum</strong>: Nur du kannst deinen Account
              verifizieren — entweder per OAuth-Login (eBay, PayPal,
              GitHub, LinkedIn) oder per Bio-Code in deiner Profil-Beschreibung
              auf Plattformen ohne API (Vinted, Kleinanzeigen, Discogs, …).
            </li>
            <li>
              <strong>Plattform-Daten</strong>: Wir lesen öffentlich
              verfügbare Bewertungs-Statistiken (Sterne, Anzahl, % positiv,
              Mitglied-seit) und zeigen sie 1:1 weiter.
            </li>
            <li>
              <strong>Identität bei KYC-Plattformen</strong>: PayPal und
              LinkedIn liefern verifizierte Klarnamen aus echten KYC-Prozessen.
              Wenn du das anzeigst, weiß der Käufer: dieser Name wurde von einer
              dritten Stelle geprüft.
            </li>
          </ul>
        </Section>

        <Section title="Was wir NICHT garantieren">
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>
              <strong>Echtheit der Bewertungen</strong>: Wir zeigen, was die
              Plattform anzeigt. Wenn ein Account gefälschte Bewertungen hat —
              das ist ein Plattform-Problem, kein Prooved-Problem.
            </li>
            <li>
              <strong>Trans aktions-Schutz</strong>: Prooved ist kein
              Treuhand-Service. Bei Käufen weiterhin Käufer-Schutz der
              jeweiligen Plattform nutzen (PayPal, eBay, ...).
            </li>
            <li>
              <strong>Aktuelle Verfügbarkeit / Lieferung</strong>: Wir zeigen
              Daten, keine Echtzeit-Aktivität.
            </li>
          </ul>
        </Section>

        <Section title="Der Vertrauens-Score">
          <p className="text-text">
            Maximal 100 Punkte aus 5 transparenten Bausteinen, jeder einzeln
            sichtbar im Profil-Breakdown:
          </p>
          <dl className="mt-3 space-y-2 rounded-2xl border border-elevated bg-surface p-5">
            <ScoreRow
              label="Identität"
              max={30}
              detail="KYC (PayPal/LinkedIn) +20 · Klarname öffentlich +5 · Bild verifiziert +5"
            />
            <ScoreRow
              label="Marktplatz-Reputation"
              max={40}
              detail="Anzahl Plattformen +10/+20/+30 · Quote ≥95% +10 · Quote <80% Strafe"
            />
            <ScoreRow
              label="Bewertungs-Volumen"
              max={15}
              detail="≥1 +5 · ≥10 +10 · ≥100 +15"
            />
            <ScoreRow
              label="Langlebigkeit"
              max={10}
              detail="Älteste Plattform-Mitgliedschaft: >1J +2 · >2J +5 · >5J +10"
            />
            <ScoreRow
              label="Aktivität"
              max={5}
              detail="Alle Verbindungen ≤7 Tage frisch +5"
            />
          </dl>
          <p className="mt-3 text-sm text-muted">
            Tier-Stufen: 0–29 Neu · 30–49 Bronze · 50–69 Silver · 70–89 Gold ·
            90+ Diamond. <strong className="text-text">Tier-Cap</strong>: bei
            unter 70 % positiver Quote wird der Score auf max. Bronze begrenzt —
            unabhängig von der Anzahl verknüpfter Plattformen.
          </p>
        </Section>

        <Section title="Was beim Lesen einer Profil-Seite zählt">
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>
              <strong>Stat-Header</strong>: positive Quote (rot wenn &lt;50 %,
              orange wenn &lt;90 %), Bewertungs-Anzahl, Aktiv-seit-Jahr.
            </li>
            <li>
              <strong>Klarname-Mismatch-Warnung</strong>: Wenn LinkedIn-Name
              und PayPal-Name nicht zusammenpassen, sieht der Käufer das.
            </li>
            <li>
              <strong>Plattform-Karten</strong>: Konkrete Bewertungs-Zahl,
              Mitglied-seit, Datenstand. Anomalien (z.B. 500 Bewertungen aber
              Account erst dieses Jahr) werden gelb markiert.
            </li>
            <li>
              <strong>Score-Breakdown</strong>: Klick auf den Score öffnet die
              vollständige Berechnung — keine versteckten Faktoren.
            </li>
          </ul>
        </Section>

        <Section title="Sicherheit deiner Daten">
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>
              OAuth-Tokens AES-256-GCM verschlüsselt, nur server-side entschlüsselt
            </li>
            <li>
              Alle OAuth-Scopes sind <strong>Read-Only</strong> — selbst bei
              Token-Leak kann niemand in deinem Namen verkaufen oder posten
            </li>
            <li>
              Bio-Code kryptographisch an deinen Prooved-Account gebunden —
              andere können fremde Profile nicht selbst verifizieren
            </li>
            <li>
              Magic-Link-Login statt Passwort — kein Brute-Force
            </li>
            <li>
              Pro Connection: Aktualisieren / Pausieren / Verstecken / Trennen
              — du behältst die Kontrolle
            </li>
            <li>
              Email-Benachrichtigung bei jeder neuen Verknüpfung — Account-Hijack
              fällt sofort auf
            </li>
          </ul>
        </Section>

        <Section title="Limits & ehrliche Hinweise">
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>
              eBay-Sandbox-Test-User haben oft 0 % positive Quote &mdash; das
              ist Plattform-Test-Daten, kein echtes Profil
            </li>
            <li>
              "Andere Plattform" verifiziert Eigentum eines beliebigen Public-Links,
              extrahiert aber keine Bewertungs-Daten
            </li>
            <li>
              Neue Marktplätze ohne offizielle API können wir nur per Bio-Code
              prüfen — das ist gegen Layout-Änderungen anfällig
            </li>
            <li>
              Wir verifizieren keine Identität auf staatlichem Niveau (Postident
              o.ä.) — KYC kommt indirekt über PayPal/LinkedIn
            </li>
          </ul>
        </Section>

        <p className="border-t border-elevated pt-6 text-center text-sm text-muted">
          Fragen? Schreib uns —{' '}
          <a
            href="mailto:hi@prooved.xyz"
            className="text-accent hover:underline"
          >
            hi@prooved.xyz
          </a>
        </p>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-text">{title}</h2>
      {children}
    </section>
  );
}

function ScoreRow({ label, max, detail }: { label: string; max: number; detail: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
      <div className="flex items-baseline gap-2">
        <dt className="font-semibold text-text">{label}</dt>
        <span className="text-sm text-muted">max {max}</span>
      </div>
      <dd className="text-sm text-muted sm:max-w-[60%] sm:text-right">{detail}</dd>
    </div>
  );
}
