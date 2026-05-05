import { Card, CardContent } from '@/shared/components/ui';

const STEPS = [
  {
    title: '1. Anmelden',
    body: 'Mit Magic Link — kein Passwort. Wähle eine eindeutige Profil-Adresse.',
  },
  {
    title: '2. Plattformen verknüpfen',
    body: 'eBay & PayPal via OAuth (Gold). Vinted & Kleinanzeigen via Bio-Code (Silver).',
  },
  {
    title: '3. Link teilen',
    body: 'prooved.de/dein-name — Käufer sehen sofort deine echte Reputation.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl space-y-6 px-4 py-12">
      <h2 className="text-2xl font-semibold">So funktioniert&apos;s</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.title}>
            <Card>
              <CardContent>
                <h3 className="font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{s.body}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
