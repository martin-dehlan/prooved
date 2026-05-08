import Link from 'next/link';
import { ExportButton } from '@/features/export';

export const metadata = { title: 'Datenschutz — Prooved' };

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted hover:text-text"
      >
        ← Zurück
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-text">
        Datenkontrolle
      </h1>

      <Section title="Welche Daten wir speichern">
        <ul className="space-y-1 text-sm text-text">
          <li>• E-Mail (Login + Reminder)</li>
          <li>• Slug + Name (öffentlich auf deinem Profil)</li>
          <li>• Plattform-IDs + verschlüsselte Tokens</li>
          <li>• Gecachte Bewertungs-Statistiken</li>
          <li>• Optional: Wallet-Adresse</li>
        </ul>
      </Section>

      <Section title="Daten exportieren">
        <p className="text-sm text-muted">
          Signiertes JSON. Du kannst es archivieren und ohne Prooved verifizieren
          (Ed25519).
        </p>
        <div className="mt-3">
          <ExportButton />
        </div>
      </Section>

      <Section title="Wallet trennen">
        <p className="text-sm text-muted">
          Entfernt deine Wallet-Verknüpfung. SBTs in der Wallet bleiben.
        </p>
        <form action="/api/wallet/disconnect" method="post" className="mt-3">
          <button className="text-sm font-semibold text-danger hover:underline">
            Wallet trennen
          </button>
        </form>
      </Section>

      <Section title="Account löschen (DSGVO)">
        <p className="text-sm text-muted">
          Löscht Account inkl. Verbindungen und Reports. On-chain SBTs bleiben in
          deiner Wallet.
        </p>
        <form action="/api/account/delete" method="post" className="mt-3">
          <button className="text-sm font-semibold text-danger hover:underline">
            Account permanent löschen
          </button>
        </form>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-elevated bg-surface p-5">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
