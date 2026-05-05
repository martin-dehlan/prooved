import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/shared/lib/supabase/server';
import { SignOutButton } from './SignOutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/register?redirect=/dashboard');

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-base font-semibold">
            Prooved
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard">Übersicht</Link>
            <Link href="/dashboard/connect">Verknüpfen</Link>
            <Link href="/dashboard/privacy">Datenschutz</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
