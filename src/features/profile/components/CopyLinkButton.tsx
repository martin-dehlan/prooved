'use client';

import { useState } from 'react';

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url =
      (typeof window !== 'undefined' ? window.location.origin : '') + '/' + slug;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — older browsers
    }
  }

  return (
    <button
      onClick={copy}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-text px-5 text-sm font-semibold text-bg transition hover:opacity-90 active:scale-[0.98]"
    >
      {copied ? '✓ Kopiert' : 'Profil-Link kopieren'}
    </button>
  );
}
