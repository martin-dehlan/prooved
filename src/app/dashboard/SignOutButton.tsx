'use client';

import { signOut } from '@/features/auth';

export function SignOutButton() {
  return (
    <button
      onClick={async () => {
        await signOut();
        window.location.href = '/';
      }}
      className="text-sm font-medium text-muted hover:text-text"
    >
      Abmelden
    </button>
  );
}
