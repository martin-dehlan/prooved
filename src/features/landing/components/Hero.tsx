import Link from 'next/link';
import { Button } from '@/shared/components/ui';

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-center sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Deine Reputation. Plattformübergreifend. Beweisbar.
      </h1>
      <p className="text-lg text-zinc-600">
        Bündele deine eBay-, PayPal-, Vinted- und Kleinanzeigen-Bewertungen in einem
        verifizierten Profil. Teile einen Link statt Screenshots.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/register">
          <Button size="lg">Jetzt loslegen</Button>
        </Link>
        <a href="#how">
          <Button size="lg" variant="outline">
            Wie funktioniert&apos;s?
          </Button>
        </a>
      </div>
      <p className="text-xs text-zinc-500">
        Prooved erstellt keine eigenen Bewertungen. Wir verifizieren nur, dass ein
        Account dir gehört, und zeigen die Bewertungen der jeweiligen Plattform.
      </p>
    </section>
  );
}
