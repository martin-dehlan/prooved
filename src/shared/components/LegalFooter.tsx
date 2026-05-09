import Link from 'next/link';

export function LegalFooter() {
  return (
    <footer className="mx-auto max-w-2xl px-5 py-8 text-center text-xs text-muted">
      <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/about" className="hover:text-text hover:underline">
          Über
        </Link>
        <span aria-hidden>·</span>
        <Link href="/privacy" className="hover:text-text hover:underline">
          Datenschutz
        </Link>
        <span aria-hidden>·</span>
        <Link href="/terms" className="hover:text-text hover:underline">
          AGB
        </Link>
        <span aria-hidden>·</span>
        <Link href="/imprint" className="hover:text-text hover:underline">
          Impressum
        </Link>
      </nav>
      <p className="mt-3 text-muted/70">© {new Date().getFullYear()} Prooved</p>
    </footer>
  );
}
