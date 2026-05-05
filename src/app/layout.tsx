import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prooved — Reputation. Plattformübergreifend. Beweisbar.',
  description:
    'Bündele eBay-, PayPal-, Vinted- und Kleinanzeigen-Bewertungen in einem verifizierten Profil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-zinc-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
