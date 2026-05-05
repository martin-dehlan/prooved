import { ExportButton } from '@/features/export';

export const metadata = { title: 'Datenschutz — Prooved' };

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Datenkontrolle</h1>

      <section className="space-y-2">
        <h2 className="font-medium">Welche Daten wir speichern</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm text-zinc-700">
          <li>E-Mail (für Login + Re-Verifizierungs-Reminder)</li>
          <li>Slug + Name (öffentlich auf deinem Profil)</li>
          <li>Verknüpfte Plattform-IDs + verschlüsselte Access-Tokens</li>
          <li>Gecachte Bewertungs-Statistiken (rating_score, count, member_since)</li>
          <li>Optional: Wallet-Adresse + Signatur-Proof</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Daten exportieren</h2>
        <p className="text-sm text-zinc-600">
          Signiertes JSON aller deiner Verknüpfungen. Du kannst es archivieren
          und ohne Prooved verifizieren (Ed25519 Signatur).
        </p>
        <ExportButton />
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Wallet trennen</h2>
        <p className="text-sm text-zinc-600">
          Entfernt deine Wallet-Verknüpfung. SBTs in der Wallet bleiben unangetastet.
        </p>
        <form action="/api/wallet/disconnect" method="post">
          <button className="text-sm text-red-600 underline">Wallet trennen</button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Account löschen (DSGVO)</h2>
        <p className="text-sm text-zinc-600">
          Löscht deinen Prooved-Account inkl. Verbindungen und Reports. On-chain
          gemintete SBTs bleiben in deiner Wallet (Blockchain ist immutable).
        </p>
        <form action="/api/account/delete" method="post">
          <button className="text-sm text-red-600 underline">
            Account permanent löschen
          </button>
        </form>
      </section>
    </div>
  );
}
