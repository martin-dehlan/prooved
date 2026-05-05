'use client';

import { useSyncExternalStore } from 'react';
import { Badge } from '@/shared/components/ui';

const subscribe = () => () => {};
const getNow = () => Date.now();
const getServerNow = () => 0;

export function ExpiryWarning({ expiresAt }: { expiresAt: string | null }) {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);
  if (!expiresAt || now === 0) return null;
  const days = Math.ceil((new Date(expiresAt).getTime() - now) / (1000 * 60 * 60 * 24));
  if (days <= 0) return <Badge variant="danger">abgelaufen</Badge>;
  if (days <= 7) return <Badge variant="danger">⚠ läuft ab in {days} Tagen</Badge>;
  if (days <= 14) return <Badge variant="warning">läuft ab in {days} Tagen</Badge>;
  return null;
}
