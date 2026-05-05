import { Suspense } from 'react';
import { RegisterFlow } from './RegisterFlow';

export const metadata = {
  title: 'Registrieren — Prooved',
};

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Anmelden</h1>
      <p className="text-sm text-zinc-600">
        Wir senden dir einen Magic Link per E-Mail. Kein Passwort nötig.
      </p>
      <Suspense fallback={<p className="text-sm text-zinc-500">Lade…</p>}>
        <RegisterFlow />
      </Suspense>
    </main>
  );
}
