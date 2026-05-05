'use client';

import { Button } from '@/shared/components/ui';
import { signOut } from '@/features/auth';

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await signOut();
        window.location.href = '/';
      }}
    >
      Abmelden
    </Button>
  );
}
