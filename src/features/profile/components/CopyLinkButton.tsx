'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui';

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
    <Button size="sm" variant="outline" onClick={copy}>
      {copied ? '✓ Kopiert' : 'Link kopieren'}
    </Button>
  );
}
